const { randomUUID } = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Enrollment = require("../models/Enrollment");
const { Feedback } = require("../models/Feedback");

describe("Feedback API", () => {
  const domain = `${randomUUID()}.example.test`;
  const tokens = {};
  let users = [];
  let courses = [];
  let modules = [];
  let enrollment;
  let feedback;
  let body;

  const userIds = () => users.map(user => user._id);
  const ownedFeedback = () => ({
    $or: [{ trainer: { $in: userIds() } }, { learner: { $in: userIds() } }],
  });
  const snapshot = async () => JSON.parse(JSON.stringify(
    await Feedback.find(ownedFeedback()).sort({ _id: 1 }).lean(),
  ));

  beforeAll(async () => {
    if (mongoose.connection.name !== "lms_test") {
      throw new Error("Feedback tests require the lms_test database");
    }

    const password = await bcrypt.hash("Password123", 10);
    const identities = [
      ["owner", "trainer"],
      ["othertrainer", "trainer"],
      ["learner", "learner"],
      ["otherlearner", "learner"],
      ["admin", "admin"],
    ];
    // Allocate IDs first so cleanup also works if fixture creation fails.
    users = identities.map(([name, role]) => ({
      _id: new mongoose.Types.ObjectId(), name, role,
      email: `${name}@${domain}`, password,
    }));
    await User.create(users);

    for (const user of users) {
      const response = await request(app).post("/api/auth/login").send({
        email: user.email, password: "Password123",
      });
      expect(response.statusCode).toBe(200);
      tokens[user.name] = response.body.data.token;
    }
  });

  beforeEach(async () => {
    courses = await Course.create(users.slice(0, 2).map(user => ({
      trainer: user._id,
      title: "Feedback test course",
      description: "Isolated feedback fixture",
      level: "beginner",
      category: "Development",
      estimatedDuration: 30,
    })));
    modules = await Module.create(courses.map(course => ({
      course: course._id,
      title: "Feedback test module",
      description: "Isolated feedback fixture",
      order: 1,
      estimatedDuration: 30,
    })));
    enrollment = await Enrollment.create({
      learner: users[2]._id, course: courses[0]._id, status: "active",
    });
    body = {
      learner: users[2]._id.toString(),
      course: courses[0].id,
      module: modules[0].id,
      comment: "Original comment",
    };
    feedback = await Feedback.create({ ...body, trainer: users[0]._id });
  });

  const cleanFixtures = async () => {
    if (mongoose.connection.name !== "lms_test" || !users.length) return;
    const ownedCourses = await Course.find({ trainer: { $in: userIds() } }).select("_id");
    const courseIds = ownedCourses.map(course => course._id);
    await Feedback.deleteMany(ownedFeedback());
    await Enrollment.deleteMany({ learner: { $in: userIds() } });
    await Module.deleteMany({ course: { $in: courseIds } });
    await Course.deleteMany({ trainer: { $in: userIds() } });
  };

  afterEach(cleanFixtures);
  afterAll(async () => {
    await cleanFixtures();
    if (mongoose.connection.name === "lms_test") {
      await User.deleteMany({ _id: { $in: userIds() } });
    }
  });

  const send = (method, token, payload, id = feedback.id) => {
    const url = method === "post" ? "/api/feedback" : `/api/feedback/${id}`;
    const call = request(app)[method](url);
    if (token) call.set("Authorization", `Bearer ${token}`);
    if (payload !== undefined) call.send(payload);
    return call;
  };

  // Rejected requests must neither expose feedback data nor change stored records.
  const expectRejected = async (call, status, message) => {
    const before = await snapshot();
    const response = await call;
    expect(response.statusCode).toBe(status);
    expect(response.body.status).toBe(status);
    expect(typeof response.body.message).toBe("string");
    if (message) expect(response.body.message).toBe(message);
    expect(Object.keys(response.body).sort()).toEqual(
      response.body.errors ? ["errors", "message", "status"] : ["message", "status"],
    );
    expect(await snapshot()).toEqual(before);
    return response;
  };

  describe("creation", () => {
    test.each(["active", "completed"])("creates and persists feedback for %s enrollment", async status => {
      enrollment.status = status;
      await enrollment.save();
      const response = await send("post", tokens.owner, { ...body, comment: "  Good progress  " });
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        status: 201, message: "Feedback created successfully",
        data: { ...body, trainer: users[0]._id.toString(), comment: "Good progress" },
      });
      const saved = await Feedback.findById(response.body.data._id).lean();
      expect(JSON.parse(JSON.stringify(saved))).toEqual(response.body.data);
      expect(await Feedback.countDocuments(ownedFeedback())).toBe(2);
    });

    test.each(["othertrainer", "learner", "admin"])("refuses creation by %s", async identity => {
      await expectRejected(send("post", tokens[identity], body), 403);
    });

    test("refuses a module belonging to another course", async () => {
      await expectRejected(send("post", tokens.owner, { ...body, module: modules[1].id }), 400,
        "Module does not belong to this course");
    });

    test("refuses an existing learner without enrollment", async () => {
      await expectRejected(send("post", tokens.owner, { ...body, learner: users[3]._id.toString() }), 400,
        "Learner is not enrolled in this course");
    });

    test("refuses cancelled enrollment", async () => {
      enrollment.status = "cancelled";
      await enrollment.save();
      await expectRejected(send("post", tokens.owner, body), 400,
        "Learner is not enrolled in this course");
    });

    test.each(["course", "module"])("returns 404 for missing %s", async field => {
      await expectRejected(send("post", tokens.owner, {
        ...body, [field]: new mongoose.Types.ObjectId().toString(),
      }), 404, `${field} not found`);
    });

    test("refuses a nonexistent learner", async () => {
      await expectRejected(send("post", tokens.owner, {
        ...body, learner: new mongoose.Types.ObjectId().toString(),
      }), 400, "Learner is not enrolled in this course");
    });

    test.each(["learner", "course", "module"])("rejects malformed %s ID", async field => {
      await expectRejected(send("post", tokens.owner, { ...body, [field]: "bad-id" }), 400,
        "Validation error");
    });

    test.each(["learner", "course", "module", "comment"])("requires %s", async field => {
      const payload = { ...body };
      delete payload[field];
      await expectRejected(send("post", tokens.owner, payload), 400, "Validation error");
    });

    test.each(["trainer", "extra"])("rejects injected %s field", async field => {
      await expectRejected(send("post", tokens.owner, { ...body, [field]: users[1]._id.toString() }), 400,
        "Validation error");
    });
  });

  describe("reading", () => {
    test.each(["owner", "learner", "admin"])("allows %s to read feedback", async identity => {
      const before = await snapshot();
      const response = await send("get", tokens[identity]);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        status: 200, message: "Feedback retrieved successfully",
        data: { _id: feedback.id, ...body, trainer: users[0]._id.toString() },
      });
      expect(await snapshot()).toEqual(before);
    });

    test.each(["othertrainer", "otherlearner"])("refuses reading by %s", async identity => {
      await expectRejected(send("get", tokens[identity]), 403,
        "You are not authorized to read this feedback");
    });
  });

  describe("updates", () => {
    test.each(["owner", "admin"])("allows %s to update only the comment", async identity => {
      const original = JSON.parse(JSON.stringify(feedback));
      const response = await send("patch", tokens[identity], { comment: "  Revised feedback  " });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        status: 200, message: "Feedback updated successfully",
        data: { _id: feedback.id, comment: "Revised feedback" },
      });
      const saved = await Feedback.findById(feedback._id).lean();
      expect(saved.comment).toBe("Revised feedback");
      for (const field of ["trainer", "learner", "course", "module"]) {
        expect(saved[field].toString()).toBe(original[field]);
        expect(response.body.data[field]).toBe(original[field]);
      }
      expect(saved.createdAt.toISOString()).toBe(original.createdAt);
      expect(await Feedback.countDocuments(ownedFeedback())).toBe(1);
      const read = await send("get", tokens.learner);
      expect(read.statusCode).toBe(200);
      expect(read.body.data.comment).toBe("Revised feedback");
    });

    test.each(["learner", "otherlearner", "othertrainer"])("refuses updates by %s", async identity => {
      await expectRejected(send("patch", tokens[identity], { comment: "Changed" }), 403);
    });

    test("requires a comment", async () => {
      await expectRejected(send("patch", tokens.owner, {}), 400, "Validation error");
    });

    test.each(["trainer", "learner", "course", "module", "extra"])("rejects changes to %s", async field => {
      await expectRejected(send("patch", tokens.admin, {
        comment: "Changed", [field]: new mongoose.Types.ObjectId().toString(),
      }), 400, "Validation error");
    });
  });

  describe.each(["post", "get", "patch"])("%s authentication and request errors", method => {
    test.each(["missing", "invalid", "expired"])("refuses %s authentication", async type => {
      let token;
      if (type === "invalid") token = "invalid-token";
      if (type === "expired") {
        token = jwt.sign({ role: "trainer" }, process.env.JWT_SECRET, {
          subject: users[0]._id.toString(), expiresIn: -1,
        });
      }
      await expectRejected(send(method, token, method === "get" ? undefined : body), 401);
    });
  });

  describe.each(["post", "patch"])("%s body validation", method => {
    test.each(["", "   ", null, 42, [], {}])("rejects invalid comment %j", async comment => {
      const payload = method === "post" ? { ...body, comment } : { comment };
      const response = await expectRejected(send(method, tokens.owner, payload), 400, "Validation error");
      expect(response.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ field: "comment", message: expect.any(String) }),
      ]));
    });

    test("rejects malformed JSON", async () => {
      const url = method === "post" ? "/api/feedback" : `/api/feedback/${feedback.id}`;
      await expectRejected(request(app)[method](url)
        .set("Authorization", `Bearer ${tokens.owner}`)
        .set("Content-Type", "application/json").send('{"comment":'), 400, "Invalid JSON");
    });
  });

  describe.each(["get", "patch"])("%s feedback lookup", method => {
    test("rejects malformed feedback ID", async () => {
      await expectRejected(send(method, tokens.owner, method === "patch" ? { comment: "Changed" } : undefined,
        "bad-id"), 400, "Invalid ID");
    });

    test("returns 404 for missing feedback", async () => {
      await expectRejected(send(method, tokens.owner, method === "patch" ? { comment: "Changed" } : undefined,
        new mongoose.Types.ObjectId().toString()), 404, "Feedback not found");
    });

    test("returns 404 for owner access when the linked course is missing", async () => {
      feedback.course = new mongoose.Types.ObjectId();
      await feedback.save();
      await expectRejected(send(method, tokens.owner, method === "patch" ? { comment: "Changed" } : undefined),
        404, "Course not found");
    });
  });
});
