const { randomUUID } = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Course = require("../../models/Course");
const Module = require("../../models/Module");
const Resource = require("../../models/Resource");
const Enrollment = require("../../models/Enrollment");
const ResourceProgress = require("../../models/ResourceProgress");
const ModuleProgress = require("../../models/ModuleProgress");

const domain = `${randomUUID()}.example.test`;
const learnerEmail = `learner@${domain}`;
const trainerEmail = `trainer@${domain}`;

const useTestAccounts = () => {
  beforeEach(async () => {
    if (mongoose.connection.name !== "lms_test") {
      throw new Error("Test accounts require the lms_test database");
    }

    const password = await bcrypt.hash("Password123", 10);
    await User.create([
      { name: "Test Learner", email: learnerEmail, password, role: "learner" },
      { name: "Test Trainer", email: trainerEmail, password, role: "trainer" },
    ]);
  });

  afterEach(async () => {
    if (mongoose.connection.name !== "lms_test") return;

    const users = await User.find({
      email: { $regex: `@${domain.replace(/\./g, "\\.")}$` },
    }).select("_id");
    const ids = users.map(user => user._id);
    const courses = await Course.find({ trainer: { $in: ids } }).select("_id");
    const courseIds = courses.map(course => course._id);
    const modules = await Module.find({ course: { $in: courseIds } }).select("_id");
    const moduleIds = modules.map(module => module._id);
    const resources = await Resource.find({ module: { $in: moduleIds } }).select("_id");
    const resourceIds = resources.map(resource => resource._id);

    await ResourceProgress.deleteMany({
      $or: [{ learner: { $in: ids } }, { resource: { $in: resourceIds } }],
    });
    await ModuleProgress.deleteMany({
      $or: [{ learner: { $in: ids } }, { module: { $in: moduleIds } }],
    });
    await Enrollment.deleteMany({
      $or: [{ learner: { $in: ids } }, { course: { $in: courseIds } }],
    });
    await Resource.deleteMany({ _id: { $in: resourceIds } });
    await Module.deleteMany({ _id: { $in: moduleIds } });
    await Course.deleteMany({ trainer: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
  });
};

module.exports = { useTestAccounts, learnerEmail, trainerEmail, domain };
