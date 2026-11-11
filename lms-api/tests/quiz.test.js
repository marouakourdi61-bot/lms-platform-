const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../app");
const Quiz = require("../models/Quiz");
const Enrollment = require("../models/Enrollment");
const ModuleProgress = require("../models/ModuleProgress");
const { useTestAccounts } = require("./helpers/accounts");
const { createLearningFixture } = require("./helpers/learning");

describe("Quiz creation and modification (FAL-173)", () => {
  let fixture;
  let ownerToken;
  let otherTrainerToken;

  // Remove only quizzes belonging to this test before account cleanup runs.
  afterEach(async () => {
    if (mongoose.connection.name !== "lms_test" || !fixture) return;
    await Quiz.deleteMany({ moduleId: { $in: fixture.modules.map(module => module._id) } });
    fixture = undefined;
  });

  useTestAccounts();

  beforeEach(async () => {
    fixture = await createLearningFixture();
    ownerToken = jwt.sign(
      { role: "trainer" }, process.env.JWT_SECRET,
      { subject: fixture.course.trainer.toString(), expiresIn: "5m" },
    );
    // Authentication uses signed subject/role claims; no user lookup is performed.
    otherTrainerToken = jwt.sign(
      { role: "trainer" }, process.env.JWT_SECRET,
      { subject: new mongoose.Types.ObjectId().toString(), expiresIn: "5m" },
    );
  });

  const payload = () => ({
    moduleId: fixture.modules[0].id,
    title: "JavaScript quiz",
    passingScore: 70,
    questions: [{
      id: "q1", text: "Which keyword declares a constant?",
      choices: [{ id: "a", text: "const" }, { id: "b", text: "let" }],
      correctChoiceId: "a",
    }],
  });

  const post = (body, token = ownerToken) => {
    const call = request(app).post("/api/quizzes");
    if (token) call.set("Authorization", `Bearer ${token}`);
    return call.send(body);
  };
  const patch = (id, body, token = ownerToken) => {
    const call = request(app).patch(`/api/quizzes/${id}`);
    if (token) call.set("Authorization", `Bearer ${token}`);
    return call.send(body);
  };

  test("owner creates a quiz and persists its module/questions", async () => {
    const response = await post(payload());
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({ status: 201, data: payload() });
    const saved = await Quiz.findById(response.body.data._id).lean();
    expect(saved.title).toBe(payload().title);
    expect(saved.moduleId.toString()).toBe(fixture.modules[0].id);
    expect(saved.questions[0].correctChoiceId).toBe("a");
  });

  test.each(["anonymous", "learner", "other trainer"])(
    "rejects creation by %s without inserting a quiz", async actor => {
      const token = actor === "anonymous" ? null : actor === "learner" ? fixture.token : otherTrainerToken;
      const response = await post(payload(), token);
      expect(response.statusCode).toBe(actor === "anonymous" ? 401 : 403);
      expect(await Quiz.countDocuments({ moduleId: fixture.modules[0]._id })).toBe(0);
    },
  );

  test.each(["score", "duplicate questions", "answer", "missing title"])(
    "rejects invalid creation: %s", async kind => {
      const body = payload();
      if (kind === "score") body.passingScore = 101;
      if (kind === "duplicate questions") body.questions.push(body.questions[0]);
      if (kind === "answer") body.questions[0].correctChoiceId = "missing";
      if (kind === "missing title") delete body.title;
      const response = await post(body);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Validation error");
      expect(await Quiz.countDocuments({ moduleId: fixture.modules[0]._id })).toBe(0);
    },
  );

  test("returns 404 when the creation module does not exist", async () => {
    const response = await post({ ...payload(), moduleId: new mongoose.Types.ObjectId().toString() });
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Module not found");
  });

  test("owner updates fields, persists false/zero and preserves omitted fields", async () => {
    const quiz = await Quiz.create(payload());
    const response = await patch(quiz.id, { title: "Updated", passingScore: 0, isActive: false, isRequired: true });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toMatchObject({ title: "Updated", passingScore: 0, isActive: false, isRequired: true });
    const saved = await Quiz.findById(quiz.id).lean();
    expect(saved).toMatchObject({ title: "Updated", passingScore: 0, isActive: false, isRequired: true });
    expect(saved.moduleId.toString()).toBe(quiz.moduleId.toString());
    expect(saved.questions).toEqual(quiz.toObject().questions);
  });

  test("owner can replace valid questions", async () => {
    const quiz = await Quiz.create(payload());
    const questions = [{ ...payload().questions[0], id: "q2", correctChoiceId: "b" }];
    expect((await patch(quiz.id, { questions })).statusCode).toBe(200);
    expect((await Quiz.findById(quiz.id)).questions[0].correctChoiceId).toBe("b");
  });

  test.each(["anonymous", "learner", "other trainer"])(
    "rejects modification by %s and preserves the saved quiz", async actor => {
      const quiz = await Quiz.create(payload());
      const token = actor === "anonymous" ? null : actor === "learner" ? fixture.token : otherTrainerToken;
      const response = await patch(quiz.id, { title: "Unauthorized change" }, token);
      expect(response.statusCode).toBe(actor === "anonymous" ? 401 : 403);
      expect((await Quiz.findById(quiz.id)).title).toBe(quiz.title);
    },
  );

  test.each([
    ["score", { passingScore: 101 }],
    ["empty body", {}],
    ["module reassignment", { moduleId: new mongoose.Types.ObjectId().toString() }],
    ["empty questions", { questions: [] }],
    ["blank title", { title: " " }],
  ])("rejects invalid modification: %s without changing data", async (name, body) => {
    const quiz = await Quiz.create(payload());
    const before = await Quiz.findById(quiz.id).lean();
    const response = await patch(quiz.id, body);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Validation error");
    expect(await Quiz.findById(quiz.id).lean()).toEqual(before);
  });

  test("returns 404 when the quiz does not exist", async () => {
    const response = await patch(new mongoose.Types.ObjectId().toString(), { title: "Updated" });
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Quiz not found");
  });

  describe("Learner quiz reads (FAL-42)", () => {
    let quiz;

    beforeEach(async () => {
      quiz = await Quiz.create(payload());
      await Enrollment.create({ learner: fixture.learner._id, course: fixture.course._id });
    });

    const get = (id, token = fixture.token) => {
      const call = request(app).get(`/api/quizzes/${id}`);
      if (token) call.set("Authorization", `Bearer ${token}`);
      return call;
    };

    test("returns only allowed fields and keeps correct answers in MongoDB", async () => {
      const response = await get(quiz.id);
      expect(response.statusCode).toBe(200);
      expect(Object.keys(response.body.data).sort()).toEqual(
        ["_id", "moduleId", "title", "passingScore", "isRequired", "isActive", "questions"].sort(),
      );
      expect(response.body.data.questions).toEqual([{
        id: "q1", text: payload().questions[0].text,
        choices: [{ id: "a", text: "const" }, { id: "b", text: "let" }],
      }]);
      expect(JSON.stringify(response.body)).not.toContain("correctChoiceId");
      expect((await Quiz.findById(quiz.id)).questions[0].correctChoiceId).toBe("a");
    });

    test.each(["anonymous", "trainer"])("rejects %s reads", async actor => {
      const response = await get(quiz.id, actor === "anonymous" ? null : ownerToken);
      expect(response.statusCode).toBe(actor === "anonymous" ? 401 : 403);
      expect(response.body.data).toBeUndefined();
    });

    test.each(["missing", "cancelled", "completed"])("rejects %s enrollment", async status => {
      if (status === "missing") {
        await Enrollment.deleteOne({ learner: fixture.learner._id, course: fixture.course._id });
      } else {
        await Enrollment.updateOne({ learner: fixture.learner._id, course: fixture.course._id }, { status });
      }
      const response = await get(quiz.id);
      expect(response.statusCode).toBe(403);
      expect(response.body.data).toBeUndefined();
    });

    test.each(["course", "module", "quiz"])("rejects unavailable %s", async kind => {
      if (kind === "course") {
        fixture.course.status = "draft";
        await fixture.course.save();
      } else if (kind === "module") {
        fixture.modules[0].status = "draft";
        await fixture.modules[0].save();
      } else {
        quiz.isActive = false;
        await quiz.save();
      }
      const response = await get(quiz.id);
      expect(response.statusCode).toBe(403);
      expect(response.body.data).toBeUndefined();
    });

    test("blocks a locked module and allows it after previous module completion", async () => {
      quiz.moduleId = fixture.modules[1]._id;
      await quiz.save();
      expect((await get(quiz.id)).statusCode).toBe(403);
      await ModuleProgress.create({
        learner: fixture.learner._id, module: fixture.modules[0]._id, status: "completed",
      });
      const response = await get(quiz.id);
      expect(response.statusCode).toBe(200);
      expect(JSON.stringify(response.body)).not.toContain("correctChoiceId");
    });

    test("returns 404 for a missing quiz", async () => {
      expect((await get(new mongoose.Types.ObjectId().toString())).statusCode).toBe(404);
    });

    test("returns 400 for an invalid quiz ID", async () => {
      expect((await get("invalid-id")).statusCode).toBe(400);
    });
  });
});
