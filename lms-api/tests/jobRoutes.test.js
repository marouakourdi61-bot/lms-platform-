
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const JobExecution = require("../models/JobExecution");
const jobHandlers = require("../services/jobHandlers");

describe("Job routes authorization", () => {
    let admin;
    let adminToken;

    beforeAll(async () => {
        const password = "Password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        admin = await User.create({
            name: "Admin Job Test",
            email: `admin-job-route-${Date.now()}@example.com`,
            password: hashedPassword,
            role: "admin",
            status: "active",
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: admin.email,
                password,
            });

        expect(loginResponse.statusCode).toBe(200);
        adminToken = loginResponse.body.data.token;
    });

    afterAll(async () => {
        if (admin) {
            await User.deleteOne({ _id: admin._id });
        }

        await JobExecution.deleteMany({
            jobName: "trainerSummary",
        });
    });

    test("should return 401 without a token", async () => {
        const response = await request(app)
            .post("/api/jobs/trainerSummary/run");

        expect(response.statusCode).toBe(401);
    });

    test("should return 404 for an unknown job", async () => {
        const response = await request(app)
            .post("/api/jobs/unknownJob/run")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(404);
    });

    test("should allow admin to run trainerSummary", async () => {
        const response = await request(app)
            .post("/api/jobs/trainerSummary/run")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.execution.status).toBe("success");
        expect(response.body.execution.jobName).toBe("trainerSummary");
    });



    test("should return 403 when learner tries to run a job", async () => {
        const password = "Password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const learner = await User.create({
            name: "Learner Job Test",
            email: `learner-job-route-${Date.now()}@example.com`,
            password: hashedPassword,
            role: "learner",
            status: "active",
        });

        try {
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({
                    email: learner.email,
                    password,
                });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.data.token;

            const response = await request(app)
                .post("/api/jobs/trainerSummary/run")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(403);
        } finally {
            await User.deleteOne({ _id: learner._id });
        }
    });



    test.each([
        ["/api/admin/jobs/inactive-reminders/run", "inactiveLearnerReminder"],
        ["/api/admin/jobs/trainer-summary/run", "trainerSummary"],
        ["/api/admin/jobs/stats/run", "statsRefresh"],
    ])("should allow admin to run %s", async (route, jobName) => {
        const response = await request(app)
            .post(route)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.execution.status).toBe("success");
        expect(response.body.execution.jobName).toBe(jobName);
    });



});
