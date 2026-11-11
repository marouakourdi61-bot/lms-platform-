const request = require("supertest");
const app = require("../../app");
const User = require("../../models/User");
const Course = require("../../models/Course");
const Module = require("../../models/Module");
const Resource = require("../../models/Resource");
const { learnerEmail, trainerEmail } = require("./accounts");

// Call after useTestAccounts has created this test's users.
const createLearningFixture = async () => {
  const learner = await User.findOne({ email: learnerEmail });
  const trainer = await User.findOne({ email: trainerEmail });
  const login = await request(app).post("/api/auth/login").send({
    email: learnerEmail,
    password: "Password123",
  });
  expect(login.statusCode).toBe(200);

  const course = await Course.create({
    trainer: trainer._id,
    title: "Learning test course",
    description: "Course for enrollment and progress tests",
    level: "beginner",
    category: "Development",
    estimatedDuration: 60,
    status: "published",
  });
  const modules = await Module.create([1, 2].map(order => ({
    course: course._id,
    title: `Module ${order}`,
    description: "Learning test module",
    order,
    estimatedDuration: 30,
    status: "published",
  })));
  const resource = await Resource.create({
    module: modules[0]._id,
    type: "link",
    url: "https://example.test/lesson",
    order: 1,
  });

  return { learner, course, modules, resource, token: login.body.data.token };
};

module.exports = { createLearningFixture };
