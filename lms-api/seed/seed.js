const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Resource = require("../models/Resource");
const Enrollment = require("../models/Enrollment");
const ModuleProgress = require("../models/ModuleProgress");
const ResourceProgress = require("../models/ResourceProgress");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

const demoPassword = process.env.SEED_DEMO_PASSWORD;
const demoCourseTitles = ["Introduction à Node.js", "API REST avec Express", "MongoDB et Mongoose"];

const seedDemoUsers = async () => {
  if (!demoPassword || demoPassword.length < 8) {
    throw new Error("SEED_DEMO_PASSWORD must be set to a value of at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(demoPassword, 10);
  const demoAccounts = [
    { name: "Demo Admin", email: "admin.demo@lms.local", role: "admin" },
    { name: "Demo Trainer", email: "trainer.demo@lms.local", role: "trainer" },
    { name: "Demo Learner", email: "learner.demo@lms.local", role: "learner" },
  ];

  const users = {};
  for (const account of demoAccounts) {
    users[account.role] = await User.findOneAndUpdate(
      { email: account.email },
      { $set: { ...account, password: passwordHash } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  return users;
};

const resetDemoData = async (trainerId) => {
  const demoCourses = await Course.find({
    trainer: trainerId,
    title: { $in: demoCourseTitles },
  }).select("_id");
  const courseIds = demoCourses.map((course) => course._id);

  if (courseIds.length === 0) return;

  const modules = await Module.find({ course: { $in: courseIds } }).select("_id");
  const moduleIds = modules.map((module) => module._id);
  const resources = await Resource.find({ module: { $in: moduleIds } }).select("_id");
  const resourceIds = resources.map((resource) => resource._id);
  const quizzes = await Quiz.find({ moduleId: { $in: moduleIds } }).select("_id");
  const quizIds = quizzes.map((quiz) => quiz._id);

  await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
  await Quiz.deleteMany({ _id: { $in: quizIds } });
  await ResourceProgress.deleteMany({ resource: { $in: resourceIds } });
  await ModuleProgress.deleteMany({ module: { $in: moduleIds } });
  await Enrollment.deleteMany({ course: { $in: courseIds } });
  await Resource.deleteMany({ _id: { $in: resourceIds } });
  await Module.deleteMany({ _id: { $in: moduleIds } });
  await Course.deleteMany({ _id: { $in: courseIds } });
};

const seed = async () => {
  await connectDB();
  const demoUsers = await seedDemoUsers();
  await resetDemoData(demoUsers.trainer._id);

  const courses = await Course.insertMany([
    {
      trainer: demoUsers.trainer._id,
      title: demoCourseTitles[0],
      description: "Bases de Node.js pour construire des applications serveur.",
      level: "beginner",
      category: "Backend",
      estimatedDuration: 6,
      status: "published",
    },
    {
      trainer: demoUsers.trainer._id,
      title: demoCourseTitles[1],
      description: "Création d'API HTTP avec Express.",
      level: "beginner",
      category: "Backend",
      estimatedDuration: 8,
      status: "published",
    },
    {
      trainer: demoUsers.trainer._id,
      title: demoCourseTitles[2],
      description: "Stockage et manipulation de données avec MongoDB et Mongoose.",
      level: "intermediate",
      category: "Database",
      estimatedDuration: 8,
      status: "published",
    },
  ]);

  const courseModules = await Module.insertMany([
    { course: courses[0]._id, title: "Introduction à Node.js", description: "Découvrir Node.js et son environnement.", order: 1, estimatedDuration: 2, status: "published" },
    { course: courses[0]._id, title: "Modules et npm", description: "Utiliser les modules et les dépendances npm.", order: 2, estimatedDuration: 2, status: "published" },
    { course: courses[1]._id, title: "Première API Express", description: "Créer des routes et traiter des requêtes HTTP.", order: 1, estimatedDuration: 3, status: "published" },
    { course: courses[1]._id, title: "Middleware et validation", description: "Organiser les traitements et valider les entrées.", order: 2, estimatedDuration: 3, status: "published" },
    { course: courses[2]._id, title: "Modèles Mongoose", description: "Définir des schémas et des modèles.", order: 1, estimatedDuration: 3, status: "published" },
    { course: courses[2]._id, title: "Requêtes et relations", description: "Lire et relier les données MongoDB.", order: 2, estimatedDuration: 3, status: "published" },
  ]);

  const resources = await Resource.insertMany([
    { module: courseModules[0]._id, type: "link", url: "https://nodejs.org/docs/latest/api/", order: 1 },
    { module: courseModules[1]._id, type: "link", url: "https://docs.npmjs.com/", order: 1 },
    { module: courseModules[2]._id, type: "link", url: "https://expressjs.com/", order: 1 },
    { module: courseModules[3]._id, type: "link", url: "https://expressjs.com/en/guide/using-middleware.html", order: 1 },
    { module: courseModules[4]._id, type: "link", url: "https://mongoosejs.com/docs/", order: 1 },
    { module: courseModules[5]._id, type: "link", url: "https://www.mongodb.com/docs/", order: 1 },
  ]);

  await Enrollment.create({
    learner: demoUsers.learner._id,
    course: courses[0]._id,
    status: "active",
    progress: 50,
  });

  await ResourceProgress.create({
    learner: demoUsers.learner._id,
    resource: resources[0]._id,
    consulted: true,
    consultedAt: new Date(),
  });

  await Quiz.create({
    moduleId: courseModules[0]._id,
    title: "Quiz: Introduction à Node.js",
    isActive: true,
    isRequired: true,
    passingScore: 60,
    questions: [
      {
        id: "q1",
        text: "Node.js permet-il d'exécuter JavaScript côté serveur ?",
        choices: [{ id: "a", text: "Oui" }, { id: "b", text: "Non" }],
        correctChoiceId: "a",
      },
      {
        id: "q2",
        text: "Quel outil est généralement fourni avec Node.js pour gérer les paquets ?",
        choices: [{ id: "a", text: "npm" }, { id: "b", text: "Mongoose" }],
        correctChoiceId: "a",
      },
      {
        id: "q3",
        text: "Node.js utilise-t-il le moteur JavaScript V8 ?",
        choices: [{ id: "a", text: "Non" }, { id: "b", text: "Oui" }],
        correctChoiceId: "b",
      },
    ],
  }).then(async (quiz) => {
    await QuizAttempt.insertMany([
      {
        learner: demoUsers.learner._id,
        quiz: quiz._id,
        answers: [
          { questionId: "q1", choiceId: "a" },
          { questionId: "q2", choiceId: "b" },
          { questionId: "q3", choiceId: "a" },
        ],
        correctCount: 1,
        totalQuestions: 3,
        scorePercent: 33.33,
        passed: false,
      },
      {
        learner: demoUsers.learner._id,
        quiz: quiz._id,
        answers: [
          { questionId: "q1", choiceId: "a" },
          { questionId: "q2", choiceId: "a" },
          { questionId: "q3", choiceId: "a" },
        ],
        correctCount: 2,
        totalQuestions: 3,
        scorePercent: 66.67,
        passed: true,
      },
    ]);
  });

  await ModuleProgress.create({
    learner: demoUsers.learner._id,
    module: courseModules[0]._id,
    status: "completed",
    completedAt: new Date(),
  });

  console.log("Demo seed completed successfully.");
  console.log("Demo accounts: admin.demo@lms.local, trainer.demo@lms.local, learner.demo@lms.local");
  console.log("Use SEED_DEMO_PASSWORD from your local environment to sign in.");
};

seed()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });