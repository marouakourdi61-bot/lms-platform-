const { useTestAccounts, learnerEmail, trainerEmail, domain } = require("./helpers/accounts");
const request = require("supertest");

const jwt = require("jsonwebtoken");

const User = require("../models/User");
const bcrypt = require("bcrypt");

const emailService = require("../services/email/emailService");
const sendEmailSpy = jest.spyOn(emailService, "sendEmail");

const app = require("../app");



describe("Authentcation", () => {
    useTestAccounts();



    //verifie l acces sans token

    test('should return 401 when no token is provided', async () => {
        const response = await request(app).get("/api/trainer/courses");

        expect(response.statusCode).toBe(401);

    });


    // verifie le rejet d'un token invalide 
    test("should return 401 when token is invalid", async () => {
        const response = await request(app)
            .get("/api/trainer/courses")
            .set("Authorization", "Bearer invalid-token");

        expect(response.statusCode).toBe(401);
    });


    //verifier q'un lerner ne peut pas acceder aux route trainer
    test("should return 403 when learner accesses trainer route", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const learnerToken = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/trainer/courses")
            .set("Authorization", `Bearer ${learnerToken}`);

        expect(response.statusCode).toBe(403);
    });



    //verifier le rejet d'un mot de passe incorrect
    test("should return 401 when login credentials are invalid", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "WrongPassword123"
            });

        expect(response.statusCode).toBe(401);
    });


    //verifier le rejet de données d'inscription invalides
    test("should return 400 when registration data is invalid", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "invalid-email",
                password: "123"
            });

        expect(response.statusCode).toBe(400);
    });


    // verifier qu'un learner peut se connecter
    test("should login successfully as learner", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "Password123"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.data.token).toBeDefined();
    });




    // verifier qu'un trainer peut se connecter
    test("should login successfully as trainer", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: trainerEmail,
                password: "Password123"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.data.token).toBeDefined();
    });




    // verifier qu'un trainer peut acceder aux routes trainer
    test("should allow trainer to access trainer route", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: trainerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const trainerToken = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/trainer/courses")
            .set("Authorization", `Bearer ${trainerToken}`);

        expect(response.statusCode).toBe(200);
    });


    // verifier la création d'un nouveau compte
    test("should register a new learner successfully", async () => {
        const email = `test-${Date.now()}@${domain}`;

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email,
                password: "Password123"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.data.email).toBe(email);
        expect(response.body.data.role).toBe("learner");
    });




    // verifier le rejet d'un email déjà utilisé
    test("should return 409 when email is already registered", async () => {
        const email = `duplicate-${Date.now()}@${domain}`;

        const firstResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Duplicate Test",
                email,
                password: "Password123"
            });

        expect(firstResponse.statusCode).toBe(201);

        const secondResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Duplicate Test",
                email,
                password: "Password123"
            });

        expect(secondResponse.statusCode).toBe(409);
    });



    // verifier qu'un utilisateur connecté peut récupérer son profil
    test("should return current user profile", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.email).toBe(learnerEmail);
    });



    // verifier l'accès au profil sans token.
    test("should return 401 when accessing profile without token", async () => {
        const response = await request(app)
            .get("/api/auth/me");

        expect(response.statusCode).toBe(401);
    });


    //verifier le rejet d'un token expiré.
    test("should return 401 when token is expired", async () => {
        const expiredToken = jwt.sign(
            {
                sub: "000000000000000000000000",
                role: "learner"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: -1
            }
        );

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${expiredToken}`);

        expect(response.statusCode).toBe(401);
    });




    //verifier le rejet d'un mauvais format d'autorisation.
    test("should return 401 when authorization header format is invalid", async () => {
        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Basic invalid-token");

        expect(response.statusCode).toBe(401);
    });



    //verifier qu'un utilisateur suspendu ne peut pas se connecter.
    test("should return 403 when user is suspended", async () => {
        const email = `suspended-${Date.now()}@${domain}`;

        const password = "Password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: "Suspended User",
            email,
            password: hashedPassword,
            role: "learner",
            status: "suspended"
        });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        expect(response.statusCode).toBe(403);

        await User.deleteOne({ _id: user._id });
    });



    test("should trigger a welcome email when a learner registers", async () => {
        sendEmailSpy.mockClear();

        const email = `email-test-${Date.now()}@${domain}`;

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Email Test User",
                email,
                password: "Password123",
            });

        expect(response.statusCode).toBe(201);

        expect(sendEmailSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                to: email,
                subject: "Bienvenue sur notre LMS",
                template: "welcome",
                data: { name: "email test user" },
                event: "user_registered",
            })
        );
    });


});


