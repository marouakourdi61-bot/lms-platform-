const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { mkdir } = require("fs/promises");
const app = require("../app");
const Course = require("../models/Course");
const Resource = require("../models/Resource");
const { useTestAccounts, learnerEmail } = require("./helpers/accounts");
const { createLearningFixture } = require("./helpers/learning");

function expectError(response, status, message) {
  expect(response.statusCode).toBe(status);
  expect(response.headers["content-type"]).toMatch(/application\/json/);
  expect(response.body).toEqual({ status, message });
}

function expectValidation(response, field) {
  expect(response.statusCode).toBe(400);
  expect(response.body).toEqual({
    status: 400,
    message: "Validation error",
    errors: expect.arrayContaining([
      { field, message: expect.any(String) },
    ]),
  });
  for (const error of response.body.errors) {
    expect(error).toEqual({ field: expect.any(String), message: expect.any(String) });
  }
}

describe("API error contract", () => {
  useTestAccounts();
  let fixture;

  beforeAll(async () => {
    await mkdir("uploads", { recursive: true });
  });

  beforeEach(async () => {
    fixture = await createLearningFixture();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const authorized = (method, path) => request(app)[method](path)
    .set("Authorization", `Bearer ${fixture.token}`);

  const trainerToken = () => jwt.sign(
    { role: "trainer" }, process.env.JWT_SECRET,
    { subject: fixture.course.trainer.toString(), expiresIn: "5m" },
  );

  test("400: Zod validation includes only field and message details", async () => {
    const response = await request(app).post("/api/auth/register")
      .send({ name: "Invalid email", email: "invalid", password: "Password123" });
    expectValidation(response, "email");
  });

  test("400: malformed JSON does not expose the submitted body or parser error", async () => {
    const response = await request(app).post("/api/auth/login")
      .set("Content-Type", "application/json").send('{"password":"private-example",');
    expectError(response, 400, "Invalid JSON");
  });

  test("400: invalid ObjectId receives a normalized response", async () => {
    expectError(await request(app).get("/api/courses/invalid-id"), 400, "Invalid ID");
  });

  test("400: real Mongoose validation errors are normalized through the route", async () => {
    // Inject a real validation error to exercise this branch without bypassing Zod in production.
    const error = new Course({}).validateSync();
    jest.spyOn(Course, "findOne").mockRejectedValueOnce(error);
    const response = await request(app).get(`/api/courses/${fixture.course.id}`);
    expectValidation(response, "title");
  });

  test.each([
    [undefined, "Authorization header missing"],
    ["Basic invalid-token", "Invalid authorization header format"],
    ["Bearer invalid-token", "Invalid token"],
  ])("401: missing or invalid authorization (%s)", async (header, message) => {
    const req = request(app).get("/api/auth/me");
    if (header) req.set("Authorization", header);
    expectError(await req, 401, message);
  });

  test("401: expired token receives a normalized response", async () => {
    const token = jwt.sign({ role: "learner" }, process.env.JWT_SECRET,
      { subject: fixture.learner.id, expiresIn: -1 });
    const response = await request(app).get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expectError(response, 401, "Token has expired");
  });

  test("401: incorrect password does not expose user data", async () => {
    const response = await request(app).post("/api/auth/login")
      .send({ email: learnerEmail, password: "WrongPassword123" });
    expectError(response, 401, "Invalid email or password");
  });

  test("403: learner cannot access trainer routes", async () => {
    expectError(await authorized("get", "/api/trainer/courses"), 403, "Forbidden");
  });

  test("403: missing enrollment includes the status in the JSON body", async () => {
    expectError(await authorized("get", `/api/courses/${fixture.course.id}/modules`),
      403, "Vous n'êtes pas inscrit à ce cours");
  });

  test("403: resume preserves the service's error.status", async () => {
    expectError(await authorized("get", `/api/courses/${fixture.course.id}/resume`),
      403, "Vous n'êtes pas inscrit à ce cours");
  });

  test("404: unknown route follows the error contract", async () => {
    expectError(await request(app).get("/api/contract-route-does-not-exist"),
      404, "Route not found: /api/contract-route-does-not-exist");
  });

  test("404: correctly formatted missing course ID follows the contract", async () => {
    expectError(await request(app).get(`/api/courses/${new mongoose.Types.ObjectId()}`),
      404, "Course not found");
  });

  test("404: progress preserves the service's error.status", async () => {
    expectError(await authorized("get", `/api/courses/${fixture.course.id}/progress`),
      404, "Inscription active introuvable");
  });

  test("409: duplicate email follows the error contract", async () => {
    const response = await request(app).post("/api/auth/register")
      .send({ name: "Duplicate", email: learnerEmail, password: "Password123" });
    expectError(response, 409, "Email already registered");
  });

  test("409: duplicate enrollment follows the error contract", async () => {
    const path = `/api/courses/${fixture.course.id}/enroll`;
    expect((await authorized("post", path)).statusCode).toBe(201);
    expectError(await authorized("post", path), 409, "Vous êtes déjà inscrit à ce cours");
  });

  test("413: real oversized multipart upload follows the error contract", async () => {
    const response = await request(app)
      .post(`/api/modules/${fixture.modules[0].id}/resources/upload`)
      .set("Authorization", `Bearer ${trainerToken()}`)
      .field("order", "2")
      .attach("file", Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: "oversized.pdf", contentType: "application/pdf",
      });
    expectError(response, 413, "File must not exceed 5 MB");
  });

  test("400: upload validation preserves field details", async () => {
    const response = await request(app)
      .post(`/api/modules/${fixture.modules[0].id}/resources/upload`)
      .set("Authorization", `Bearer ${trainerToken()}`)
      .field("order", "invalid")
      .attach("file", Buffer.from("%PDF-1.4\n"), {
        filename: "validation.pdf", contentType: "application/pdf",
      });
    expectValidation(response, "order");
  });

  test.each([undefined, 503])("500/503: injected server failure hides internal details (%s)", async statusCode => {
    const error = new Error("Private database diagnostic");
    if (statusCode) error.statusCode = statusCode;
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(Resource, "find").mockReturnValueOnce({
      sort: jest.fn().mockRejectedValueOnce(error),
    });
    const response = await request(app).get(`/api/modules/${fixture.modules[0].id}/resources`);
    expectError(response, statusCode || 500, "Internal server error");
    expect(log).toHaveBeenCalledWith(error);
  });
});
