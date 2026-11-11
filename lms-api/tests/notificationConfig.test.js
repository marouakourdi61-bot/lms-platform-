const request = require("supertest");
const app = require("../app");
const { useTestAccounts, learnerEmail } = require("./helpers/accounts");

const User = require("../models/User");
const bcrypt = require("bcrypt");
const NotificationConfig = require("../models/NotificationConfig");


describe("Notification CONFIG Authorization", () => {
    useTestAccounts();

    test("should return 401 when unauthenticated user accesses config", async () => {
        const response = await request(app)
            .get("/api/config/notifications");

        expect(response.statusCode).toBe(401);
    });

    test("should return 403 when learner accesses config", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: learnerEmail,
                password: "Password123",
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .get("/api/config/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
    });


    test("should allow admin to read and update notification config", async () => {
        const email = `admin-config-${Date.now()}@example.com`;
        const password = "Password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: "Admin CONFIG Test",
            email,
            password: hashedPassword,
            role: "admin",
            status: "active",
        });

        try {
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email, password });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.data.token;

            // create the config before testing PATCH
            await NotificationConfig.findOneAndUpdate(
                { key: "global" },
                {
                    $setOnInsert: {
                        key: "global",
                        notifications: {
                            enabled: true,
                            emailDriver: "log",
                        },
                    },
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                }
            );

            const getResponse = await request(app)
                .get("/api/config/notifications")
                .set("Authorization", `Bearer ${token}`);

            

            expect(getResponse.statusCode).toBe(200);

            const updateResponse = await request(app)
                .patch("/api/config/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    notifications: {
                        enabled: false,
                    },
                });

            expect(updateResponse.statusCode).toBe(200);
            expect(updateResponse.body.config.notifications.enabled).toBe(false);

            const savedConfig = await NotificationConfig.findOne({ key: "global" });
            expect(savedConfig.notifications.enabled).toBe(false);
        } finally {
            await User.deleteOne({ _id: user._id });
            await NotificationConfig.deleteOne({ key: "global" });
        }
    });



    test("should reject invalid notification config values", async () => {
        const email = `admin-validation-${Date.now()}@example.com`;
        const password = "Password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: "Admin Validation Test",
            email,
            password: hashedPassword,
            role: "admin",
            status: "active",
        });

        try {
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email, password });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.data.token;

            const response = await request(app)
                .patch("/api/config/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    notifications: {
                        emailDriver: "invalid-driver",
                    },
                });

            expect(response.statusCode).toBe(400);
        } finally {
            await User.deleteOne({ _id: user._id });
        }
    });




    test("should reject invalid inactiveDays", async () => {
        const email = `admin-jobs-${Date.now()}@example.com`;
        const password = "Password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: "Admin Jobs Test",
            email,
            password: hashedPassword,
            role: "admin",
            status: "active",
        });

        try {
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email, password });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.data.token;

            const response = await request(app)
                .patch("/api/config/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    jobs: {
                        inactiveLearnerReminder: {
                            enabled: true,
                            frequency: "0 9 * * *",
                            inactiveDays: 0,
                        },
                    },
                });

            expect(response.statusCode).toBe(400);
        } finally {
            await User.deleteOne({ _id: user._id });
        }
    });



    test("should reject invalid cron frequency", async () => {
        const email = `admin-cron-${Date.now()}@example.com`;
        const password = "Password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: "Admin Cron Test",
            email,
            password: hashedPassword,
            role: "admin",
            status: "active",
        });

        try {
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({ email, password });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.data.token;

            const response = await request(app)
                .patch("/api/config/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    jobs: {
                        trainerSummary: {
                            enabled: true,
                            frequency: "abc",
                        },
                    },
                });

            expect(response.statusCode).toBe(400);
        } finally {
            await User.deleteOne({ _id: user._id });
        }
    });

});