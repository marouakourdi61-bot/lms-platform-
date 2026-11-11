const Module = require("../models/Module");
const Course = require("../models/Course");

const getModulesByCourse = async (req, res, next) => {
    try {
        const modules = await Module.find({
            course: req.params.id,
            status: "published"
        }).sort({ order: 1 });

        res.status(200).json({
            count: modules.length,
            data: modules
        });
    } catch (error) {
        next(error);
    }
};

const createModule = async (req, res, next) => {
    try {
        const {
            title,
            description,
            order,
            estimatedDuration,
            status
        } = req.body;

        // Vérifier si le titre existe déjà dans ce course
        const existingModule = await Module.findOne({
            title,
            course: req.params.courseId
        });

        if (existingModule) {
            return res.status(409).json({
                status: 409,
                message: "Title already exists"
            });
        }

        // verifier si l'ordre existe déjà dans ce course
        const existingOrder = await Module.findOne({
            course: req.params.courseId,
            order
        });

        if (existingOrder) {
            return res.status(409).json({
                status: 409,
                message: "Order already exists for this course"
            });
        }

        const module = await Module.create({
            course: req.params.courseId,
            title,
            description,
            order,
            estimatedDuration,
            status
        });

        res.status(201).json({
            message: "Module créé avec succès",
            data: module
        });

    } catch (error) {
        next(error);
    }
};

const updateModule = async (req, res, next) => {
    try {
        const { title, description, order, estimatedDuration, status } = req.body;

        const module = await Module.findByIdAndUpdate(
            req.params.moduleId,
            {
                title,
                description,
                order,
                estimatedDuration,
                status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!module) {
            return res.status(404).json({
                status: 404,
                message: "Module introuvable"
            });
        }

        res.status(200).json({
            message: "Module modifié avec succès",
            data: module
        });


    } catch (error) {
        next(error);
    }
};

const deleteModule = async (req, res, next) => {
    try {
        const module = await Module.findByIdAndDelete(
            req.params.moduleId
        );

        if (!module) {
            return res.status(404).json({
                status: 404,
                message: "Module introuvable"
            });
        }

        res.status(200).json({
            message: "Module supprimé avec succès"
        });

    } catch (error) {
        next(error);
    }
};


const changeModuleStatus = async (req, res, next) => {
  try {
    const { status } = req.params;

    if (!["published", "draft"].includes(status)) {
      const error = new Error("Status must be published or draft");
      error.statusCode = 400;
      return next(error);
    }

    const module = await Module.findById(req.params.moduleId);

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
        "You are not authorized to change this module's status",
      );
      error.statusCode = 403;
      return next(error);
    }

    if (module.status === status) {
      return res.status(200).json({
        status: 200,
        message:
          status === "published"
            ? "Module is already published"
            : "Module is already a draft",
        data: module,
      });
    }

    module.status = status;

    await module.save();

    res.status(200).json({
      status: 200,
      message: "Module status updated successfully",
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    getModulesByCourse,
    createModule,
    updateModule,
    deleteModule,
    changeModuleStatus
};
