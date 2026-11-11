const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Enrollment = require("../models/Enrollment");
const { useTestAccounts } = require("./helpers/accounts");
const { createLearningFixture } = require("./helpers/learning");

describe("Course enrollment", () => {
  useTestAccounts();
  let fixture;

  beforeEach(async () => {
    fixture = await createLearningFixture();
  });

  const enroll = () => request(app)
    .post(`/api/courses/${fixture.course.id}/enroll`)
    .set("Authorization", `Bearer ${fixture.token}`);

  test("should reject enrollment without a token", async () => {
    const response = await request(app).post(`/api/courses/${fixture.course.id}/enroll`);
    expect(response.statusCode).toBe(401);
    expect(await Enrollment.countDocuments({ course: fixture.course._id })).toBe(0);
  });

  test("should enroll the authenticated learner in a published course", async () => {
    const response = await enroll();
    expect(response.statusCode).toBe(201);
    expect(response.body.enrollment).toMatchObject({
      learner: fixture.learner.id,
      course: fixture.course.id,
      status: "active",
      progress: 0,
    });
    expect(await Enrollment.countDocuments({
      learner: fixture.learner._id, course: fixture.course._id,
    })).toBe(1);
  });

  test("should reject duplicate enrollment without creating another record", async () => {
    expect((await enroll()).statusCode).toBe(201);
    expect((await enroll()).statusCode).toBe(409);
    expect(await Enrollment.countDocuments({ course: fixture.course._id })).toBe(1);
  });

  test.each(["draft", "archived"])("should reject enrollment in a %s course", async status => {
    fixture.course.status = status;
    await fixture.course.save();
    expect((await enroll()).statusCode).toBe(400);
    expect(await Enrollment.countDocuments({ course: fixture.course._id })).toBe(0);
  });

  test("should return 404 for a missing course", async () => {
    const response = await request(app)
      .post(`/api/courses/${new mongoose.Types.ObjectId()}/enroll`)
      .set("Authorization", `Bearer ${fixture.token}`);
    expect(response.statusCode).toBe(404);
  });

  test("should list only the current user's enrollments", async () => {
    expect((await enroll()).statusCode).toBe(201);
    await Enrollment.create({ learner: fixture.course.trainer, course: fixture.course._id });
    const response = await request(app).get("/api/enrollments/me")
      .set("Authorization", `Bearer ${fixture.token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].learner).toBe(fixture.learner.id);
    expect(response.body[0].course._id).toBe(fixture.course.id);
  });

  test("should grant access to course modules only after enrollment", async () => {
    const getModules = () => request(app).get(`/api/courses/${fixture.course.id}/modules`)
      .set("Authorization", `Bearer ${fixture.token}`);
    expect((await getModules()).statusCode).toBe(403);
    expect((await enroll()).statusCode).toBe(201);
    const response = await getModules();
    expect(response.statusCode).toBe(200);
    expect(response.body.data.map(module => module._id))
      .toEqual(fixture.modules.map(module => module.id));
  });
});
