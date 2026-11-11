const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Module = require("../models/Module");

const getCourses = async (req, res, next) => {
  try {
    const { category, level, keyword, sortBy } = req.query;

    const filter = {
      status: "published",
    };

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (keyword) {
      filter.$or = [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    let sort = {
      createdAt: -1,
    };

    if (sortBy === "publishedAt") {
      sort = {
        publishedAt: -1,
      };
    }

    const courses = await Course.find(filter).sort(sort);

    res.status(200).json({
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      status: "published",
    });

    if (!course) {
      return res.status(404).json({
        status: 404,
        message: "Course not found",
      });
    }

    res.status(200).json({
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      objectives,
      level,
      category,
      estimatedDuration,
    } = req.body;

    const course = await Course.create({
      title,
      description,
      objectives,
      level,
      category,
      estimatedDuration,
      trainer: req.user.id,
    });

    res.status(201).json({
      status: 201,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      const err = new Error("course not found");
      err.statusCode = 404;
      return next(err);
    }
    if (course.trainer.toString() !== req.user.id) {
      const err = new Error("You are not authorized to update this course");
      err.statusCode = 403;
      return next(err);
    }

    const {
      title,
      description,
      objectives,
      level,
      category,
      estimatedDuration,
    } = req.body;

    course.title = title;
    course.description = description;
    course.objectives = objectives;
    course.level = level;
    course.category = category;
    course.estimatedDuration = estimatedDuration;

    await course.save();
    res.status(200).json({
      status: 200,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      const err = new Error("course not found");
      err.statusCode = 404;
      return next(err);
    }
    if (course.trainer.toString() !== req.user.id) {
      const err = new Error("You are not authorized to delete this course");
      err.statusCode = 403;
      return next(err);
    }

    const hasModule = await Module.exists({ course: course._id });
    const hasEnrollment = await Enrollment.exists({ course: course._id });

    if (hasModule || hasEnrollment) {
      const err = new Error(
        "Cannot delete course with associated modules or enrollments",
      );
      err.statusCode = 409;
      return next(err);
    }
    await course.deleteOne();
    res.status(200).json({
      status: 200,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
const changeCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    if (!["published", "draft", "archived"].includes(status)) {
      const error = new Error("Status must be published, draft or archived ");
      error.statusCode = 400;
      return next(error);
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      return next(error);
    }
    if (course.trainer.toString() !== req.user.id) {
      const error = new Error(
        "You are not authorized to change this course's status",
      );
      error.statusCode = 403;
      return next(error);
    }

    if (course.status === status) {
      return res.status(200).json({
        status: 200,
        message:
          status === "published"
            ? "Course is already published"
            : status === "draft"
            ? "Course is already a draft"
            : "course is already archived",
        data: course,
      });
    }

    if (status === "published") {
      course.publishedAt = new Date();
    } else if (status === "draft") {
      course.publishedAt = null;
    }
    course.status = status;
    await course.save();

    res.status(200).json({
      status: 200,
      message: "Course status updated successfully",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  changeCourseStatus,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
