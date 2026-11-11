const { useTestAccounts, learnerEmail, trainerEmail, domain } = require("./helpers/accounts");

const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const bcrypt = require("bcrypt");



describe("Role Authorization", () => {
    useTestAccounts();
    //verifier qu'un learner ne peut pas accéder aux routes trainer.
    test("should return 403 when learner accesses trainer route", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/trainer/courses")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
    });

    //verifier qu'un trainer peut accéder aux routes trainer.
    test("should allow trainer to access trainer route", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: trainerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/trainer/courses")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
    });

    // verifier qu'un admin ne peut pas accéder à une route réservée au trainer.
    test("should return 403 when admin accesses trainer route", async () => {
        const email = `admin-test-${Date.now()}@${domain}`;
        const password = "Password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: "Admin Test",
            email,
            password: hashedPassword,
            role: "admin",
            status: "active"
        });

        try {
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email, password });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.data.token;

            const response = await request(app)
                .get("/api/trainer/courses")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(403);
        } finally {
            await User.deleteOne({ _id: user._id });
        }
    });




    // Vérifier qu'un learner ne peut pas créer un cours.
    test("should return 403 when learner tries to create a course", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .post("/api/courses")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Test Course",
                description: "Course for authorization testing",
                level: "beginner",
                category: "Development",
                estimatedDuration: 60
            });

        expect(response.statusCode).toBe(403);
    });





    // verifier qu'un learner ne peut pas modifier un cours
    test("should return 403 when learner tries to update a course", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .put("/api/courses/68da12345678901234567890")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Updated Course",
                description: "Updated description",
                level: "beginner",
                category: "Development",
                estimatedDuration: 90
            });

        expect(response.statusCode).toBe(403);
    });





    test("should return 403 when learner tries to delete a course", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .delete("/api/courses/68da12345678901234567890")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
    });





    test("should return 403 when learner tries to publish a course", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .patch("/api/courses/68da12345678901234567890/published")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
    });





    test("should allow trainer to create a course", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: trainerEmail,
                password: "Password123"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .post("/api/courses")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Test Course Jest",
                description: "Course created for authorization testing",
                objectives: ["Learn API testing"],
                level: "beginner",
                category: "Development",
                estimatedDuration: 60
            });

        expect(response.statusCode).toBe(201);
    });








});
