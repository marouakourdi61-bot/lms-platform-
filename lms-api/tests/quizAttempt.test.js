const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const { submitQuizAttempt } = require("../services/quizAttemptService");
const { useTestAccounts, domain } = require("./helpers/accounts");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const bcrypt = require("bcrypt");
const { createLearningFixture } = require("./helpers/learning");
const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");

describe("QuizAttempt persistence", () => {
  let fixture;
  let quiz;

  afterEach(async () => {
    if (mongoose.connection.name !== "lms_test" || !fixture) return;

    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await Quiz.deleteOne({ _id: quiz._id });
    fixture = undefined;
    quiz = undefined;
  });

  useTestAccounts();

  beforeEach(async () => {
    fixture = await createLearningFixture();

    quiz = await Quiz.create({
      moduleId: fixture.modules[0]._id,
      title: "Test quiz",
      passingScore: 60,
      questions: [
        {
          id: "q1",
          text: "Test question",
          choices: [
            { id: "a", text: "Answer A" },
            { id: "b", text: "Answer B" },
          ],
          correctChoiceId: "a",
        },
      ],
    });
  });

  test("saves an attempt linked to the learner and quiz", async () => {
    const savedAttempt = await QuizAttempt.create({
      learner: fixture.learner._id,
      quiz: quiz._id,
      correctCount: 1,
      totalQuestions: 1,
      scorePercent: 100,
      passed: true,
    });

    const foundAttempt = await QuizAttempt.findById(savedAttempt._id);

    expect(foundAttempt.learner.toString()).toBe(fixture.learner._id.toString());
    expect(foundAttempt.quiz.toString()).toBe(quiz._id.toString());
    expect(foundAttempt.scorePercent).toBe(100);
    expect(foundAttempt.passed).toBe(true);
    expect(foundAttempt.createdAt).toBeInstanceOf(Date);
  });

  test("calculates the score from answers and saves the attempt", async () => {
    const attempt = await submitQuizAttempt({
      quizId: quiz._id,
      learnerId: fixture.learner._id,
      answers: [{ questionId: "q1", choiceId: "a" }],
    });

    expect(attempt.correctCount).toBe(1);
    expect(attempt.totalQuestions).toBe(1);
    expect(attempt.scorePercent).toBe(100);
    expect(attempt.passed).toBe(true);
  });

  test("submits answers and saves the calculated attempt", async () => {
    const response = await request(app)
      .post(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`)
      .send({
        answers: [{ questionId: "q1", choiceId: "a" }],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data).toMatchObject({
      learner: fixture.learner._id.toString(),
      quiz: quiz._id.toString(),
      correctCount: 1,
      totalQuestions: 1,
      scorePercent: 100,
      passed: true,
    });

    const savedAttempt = await QuizAttempt.findById(response.body.data._id);

    expect(savedAttempt).not.toBeNull();
  });

  test("saves a failed attempt when the score is below the passing threshold", async () => {
    const response = await request(app)
      .post(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`)
      .send({
        answers: [{ questionId: "q1", choiceId: "b" }],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data).toMatchObject({
      answers: [{ questionId: "q1", choiceId: "b" }],
      correctCount: 0,
      totalQuestions: 1,
      scorePercent: 0,
      passed: false,
    });

    const savedAttempt = await QuizAttempt.findById(response.body.data._id);

    expect(savedAttempt).not.toBeNull();
    expect(savedAttempt.passed).toBe(false);
    expect(savedAttempt.answers[0]).toMatchObject({
      questionId: "q1",
      choiceId: "b",
    });
  });

  test("rejects a client-supplied score", async () => {
    const response = await request(app)
      .post(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`)
      .send({
        answers: [{ questionId: "q1", choiceId: "b" }],
        scorePercent: 100,
        passed: true,
      });

    expect(response.statusCode).toBe(400);
    expect(await QuizAttempt.countDocuments({ quiz: quiz._id })).toBe(0);
  });

  test("rejects an answer for a question outside the quiz", async () => {
    const response = await request(app)
      .post(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`)
      .send({
        answers: [{ questionId: "q999", choiceId: "a" }],
      });

    expect(response.statusCode).toBe(400);
    expect(await QuizAttempt.countDocuments({ quiz: quiz._id })).toBe(0);
  });

  test("rejects a choice outside the submitted question", async () => {
    const response = await request(app)
      .post(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`)
      .send({
        answers: [{ questionId: "q1", choiceId: "q999-choice" }],
      });

    expect(response.statusCode).toBe(400);
    expect(await QuizAttempt.countDocuments({ quiz: quiz._id })).toBe(0);
  });

  test("allows the course trainer to view learner attempts", async () => {
    await QuizAttempt.create({
      learner: fixture.learner._id,
      quiz: quiz._id,
      correctCount: 1,
      totalQuestions: 1,
      scorePercent: 100,
      passed: true,
    });

    const trainerToken = jwt.sign(
      { role: "trainer" },
      process.env.JWT_SECRET,
      {
        subject: fixture.course.trainer.toString(),
        expiresIn: "5m",
      },
    );

    const response = await request(app)
      .get(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${trainerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].learner).toBe(fixture.learner._id.toString());
  });

  test("rejects another trainer from viewing learner attempts", async () => {
    await QuizAttempt.create({
      learner: fixture.learner._id,
      quiz: quiz._id,
      correctCount: 1,
      totalQuestions: 1,
      scorePercent: 100,
      passed: true,
    });

    const otherTrainerId = new mongoose.Types.ObjectId();

    const otherTrainerToken = jwt.sign(
      { role: "trainer" },
      process.env.JWT_SECRET,
      {
        subject: otherTrainerId.toString(),
        expiresIn: "5m",
      },
    );

    const response = await request(app)
      .get(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${otherTrainerToken}`);

    expect(response.statusCode).toBe(403);
  });

  // Allow only attempt results and the learner's submitted answers in responses.
  const expectPrivateAttempt = (attempt) => {
    expect(Object.keys(attempt).sort()).toEqual([
      "_id", "__v", "learner", "quiz", "answers", "correctCount",
      "totalQuestions", "scorePercent", "passed", "createdAt", "updatedAt",
    ].sort());
    expect(attempt.quiz).toBe(quiz.id);
    for (const answer of attempt.answers) {
      expect(Object.keys(answer).sort()).toEqual(["_id", "questionId", "choiceId"].sort());
    }
    expect(JSON.stringify(attempt)).not.toContain("correctChoiceId");
    expect(attempt).not.toHaveProperty("questions");
  };

  test.each([
    ["a", 100, true],
    ["b", 0, false],
  ])("keeps answer keys private after submitting choice %s", async (choiceId, scorePercent, passed) => {
    await Enrollment.create({ learner: fixture.learner._id, course: fixture.course._id });
    const response = await request(app)
      .post(`/api/quizzes/${quiz.id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`)
      .send({ answers: [{ questionId: "q1", choiceId }] });

    expect(response.statusCode).toBe(201);
    expect(Object.keys(response.body).sort()).toEqual(["data", "message", "status"]);
    expect(response.body.data).toMatchObject({
      learner: fixture.learner.id, scorePercent, passed,
      answers: [{ questionId: "q1", choiceId }],
    });
    expectPrivateAttempt(response.body.data);
    const saved = await QuizAttempt.findById(response.body.data._id);
    expect(saved.learner.toString()).toBe(fixture.learner.id);
    expect(saved.scorePercent).toBe(scorePercent);

    const history = await request(app)
      .get(`/api/quizzes/${quiz.id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`);
    expect(history.statusCode).toBe(200);
    expect(history.body.data).toHaveLength(1);
    expectPrivateAttempt(history.body.data[0]);
    expect(history.body.data[0]._id).toBe(saved.id);
    expect(history.body.data[0].answers[0].choiceId).toBe(choiceId);

    // Backend scoring must retain the private answer even after serialization.
    const privateQuiz = await Quiz.findById(quiz._id);
    expect(privateQuiz.questions[0].correctChoiceId).toBe("a");
  });


   

  test("isolates two real learners' histories even with a forged learner query", async () => {
    const secondLearner = await User.create({
      name: "Second privacy learner",
      email: `privacy-learner@${domain}`,
      password: await bcrypt.hash("Password123", 10),
      role: "learner",
    });
    const login = await request(app).post("/api/auth/login").send({
      email: secondLearner.email, password: "Password123",
    });
    expect(login.statusCode).toBe(200);
    await Enrollment.create([fixture.learner, secondLearner].map(learner => ({
      learner: learner._id, course: fixture.course._id,
    })));
    const identities = [
      { user: fixture.learner, token: fixture.token, choiceId: "a" },
      { user: secondLearner, token: login.body.data.token, choiceId: "b" },
    ];
    const attemptIds = [];
    for (const identity of identities) {
      const submission = await request(app)
        .post(`/api/quizzes/${quiz.id}/attempts`)
        .set("Authorization", `Bearer ${identity.token}`)
        .send({ answers: [{ questionId: "q1", choiceId: identity.choiceId }] });
      expect(submission.statusCode).toBe(201);
      expect(submission.body.data.learner).toBe(identity.user.id);
      expectPrivateAttempt(submission.body.data);
      attemptIds.push(submission.body.data._id);
    }

    for (const [index, identity] of identities.entries()) {
      const other = identities[1 - index];
      const history = await request(app)
        .get(`/api/quizzes/${quiz.id}/attempts`)
        .query({ learner: other.user.id, learnerId: other.user.id })
        .set("Authorization", `Bearer ${identity.token}`);
      expect(history.statusCode).toBe(200);
      expect(Object.keys(history.body).sort()).toEqual(["data", "message", "status"]);
      expect(history.body.data).toHaveLength(1);
      expect(history.body.data[0]._id).toBe(attemptIds[index]);
      expect(history.body.data[0].learner).toBe(identity.user.id);
      expect(history.body.data[0].answers[0].choiceId).toBe(identity.choiceId);
      expectPrivateAttempt(history.body.data[0]);
      expect(JSON.stringify(history.body)).not.toContain(attemptIds[1 - index]);
      expect(JSON.stringify(history.body)).not.toContain(other.user.id);
    }
    expect(await QuizAttempt.countDocuments({ quiz: quiz._id })).toBe(2);
    expect((await Quiz.findById(quiz._id)).questions[0].correctChoiceId).toBe("a");
  });

  test.each(["post", "get"])("anonymous %s exposes no attempts and writes nothing", async method => {
    const call = request(app)[method](`/api/quizzes/${quiz.id}/attempts`);
    if (method === "post") call.send({ answers: [{ questionId: "q1", choiceId: "a" }] });
    const response = await call;
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe(401);
    expect(Object.keys(response.body).sort()).toEqual(["message", "status"]);
    expect(await QuizAttempt.countDocuments({ quiz: quiz._id })).toBe(0);
  });
});
