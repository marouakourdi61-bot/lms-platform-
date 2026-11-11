const Quiz = require("../models/Quiz");
const Module = require("../models/Module");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const ModuleProgress = require("../models/ModuleProgress");

const createQuiz = async (req, res, next) => {
  try {
    const module = await Module.findById(req.body.moduleId);
    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      return next(error);
    }

    const course = await Course.findById(module.course);
    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      return next(error);
    }

    if (course.trainer.toString() !== req.user.id) {
      const error = new Error(
        "You are not authorized to create a quiz for this course",
      );
      error.statusCode = 403;
      return next(error);
    }

    const quiz = await Quiz.create(req.body);
    res.status(201).json({
      status: 201,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      const error = new Error("Quiz not found");
      error.statusCode = 404;
      return next(error);
    }

    const module = await Module.findById(quiz.moduleId);
    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      return next(error);
    }

    const course = await Course.findById(module.course);
    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      return next(error);
    }

    if (course.trainer.toString() !== req.user.id) {
      const error = new Error("You are not authorized to update this quiz");
      error.statusCode = 403;
      return next(error);
    }

    const { title, questions, passingScore, isActive, isRequired } = req.body;

    if (title !== undefined) {
      quiz.title = title;
    }
    if (questions !== undefined) {
      quiz.questions = questions;
    }
    if (passingScore !== undefined) {
      quiz.passingScore = passingScore;
    }
    if (isActive !== undefined) {
      quiz.isActive = isActive;
    }
    if (isRequired !== undefined) {
      quiz.isRequired = isRequired;
    }

    await quiz.save();
    res.status(200).json({
      status: 200,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      const error = new Error("Quiz not found");
      error.statusCode = 404;
      return next(error);
    }

    const module = await Module.findById(quiz.moduleId);
    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      return next(error);
    }

    const course = await Course.findById(module.course);
    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      return next(error);
    }

    const enrollment = await Enrollment.findOne({
      learner: req.user.id,
      course: course._id,
      status: "active",
    });
    if (!enrollment) {
      const error = new Error("You are not enrolled in this course");
      error.statusCode = 403;
      return next(error);
    }

    if (course.status !== "published" || module.status !== "published") {
      const error = new Error("Quiz content is not available");
      error.statusCode = 403;
      return next(error);
    }

    if (!quiz.isActive) {
      const error = new Error("Quiz is not active");
      error.statusCode = 403;
      return next(error);
    }

    const previousModule = await Module.findOne({
      course: module.course,
      order: module.order - 1,
      status: "published",
    });

    if (previousModule) {
      const previousProgress = await ModuleProgress.findOne({
        learner: req.user.id,
        module: previousModule._id,
        status: "completed",
      });

      if (!previousProgress) {
        const error = new Error("Complete the previous module first");
        error.statusCode = 403;
        return next(error);
      }
    }

    const safeQuiz = {
      _id: quiz._id,
      moduleId: quiz.moduleId,
      title: quiz.title,
      passingScore: quiz.passingScore,
      isRequired: quiz.isRequired,
      isActive: quiz.isActive,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        text: question.text,
        choices: question.choices.map((choice) => ({
          id: choice.id,
          text: choice.text,
        })),
      })),
    };

    return res.status(200).json({
      status: 200,
      message: "Quiz retrieved successfully",
      data: safeQuiz,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  updateQuiz,
  getQuiz,
};
