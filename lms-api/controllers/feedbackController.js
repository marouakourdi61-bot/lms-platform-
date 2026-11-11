const Course = require("../models/Course.js");
const Module = require("../models/Module.js");
const { Feedback } = require("../models/Feedback.js");
const Enrollment = require("../models/Enrollment.js");
const { roles } = require("../consts/roles.js");

const createFeedback = async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.course);
    if (!course) {
      const error = new Error("course not found");
      error.statusCode = 404;
      return next(error);
    }

    if (course.trainer.toString() !== req.user.id) {
      const error = new Error(
        "You are not authorized to give feedback for this course",
      );
      error.statusCode = 403;
      return next(error);
    }

    const module = await Module.findById(req.body.module);
    if (!module) {
      const error = new Error("module not found");
      error.statusCode = 404;
      return next(error);
    }

    if (module.course.toString() !== course._id.toString()) {
      const error = new Error("Module does not belong to this course");
      error.statusCode = 400;
      return next(error);
    }

    const enrollment = await Enrollment.findOne({
      learner: req.body.learner,
      course: course._id,
      status: { $in: ["active", "completed"] },
    });

    if (!enrollment) {
      const error = new Error("Learner is not enrolled in this course");
      error.statusCode = 400;
      return next(error);
    }

    const feedback = await Feedback.create({
      trainer: req.user.id,
      learner: req.body.learner,
      course: course._id,
      module: module._id,
      comment: req.body.comment,
    });

    return res.status(201).json({
      status: 201,
      message: "Feedback created successfully",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    if (!req.user) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      return next(error);
    }

    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      const error = new Error("Feedback not found");
      error.statusCode = 404;
      return next(error);
    }

    let canRead = req.user.role === roles.ADMIN;

    if (req.user.role === roles.LEARNER) {
      canRead = feedback.learner.toString() === req.user.id;
    }

    if (req.user.role === roles.TRAINER) {
      const course = await Course.findById(feedback.course);

      if (!course) {
        const error = new Error("Course not found");
        error.statusCode = 404;
        return next(error);
      }

      canRead = course.trainer.toString() === req.user.id;
    }

    if (!canRead) {
      const error = new Error("You are not authorized to read this feedback");
      error.statusCode = 403;
      return next(error);
    }

    return res.status(200).json({
      status: 200,
      message: "Feedback retrieved successfully",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      const error = new Error("Feedback not found");
      error.statusCode = 404;
      return next(error);
    }

    if (req.user.role === roles.TRAINER) {
      const course = await Course.findById(feedback.course);

      if (!course) {
        const error = new Error("Course not found");
        error.statusCode = 404;
        return next(error);
      }

      if (course.trainer.toString() !== req.user.id) {
        const error = new Error("You are not authorized to update this feedback");
        error.statusCode = 403;
        return next(error);
      }
    }

    feedback.comment = req.body.comment;
    await feedback.save();

    return res.status(200).json({
      status: 200,
      message: "Feedback updated successfully",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFeedback,
  getFeedback,
  updateFeedback,
};


