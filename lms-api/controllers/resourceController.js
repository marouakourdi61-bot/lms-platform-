const Resource = require("../models/Resource");
const Module = require("../models/Module");
const Course = require("../models/Course");
const ResourceProgress = require("../models/ResourceProgress");
const { unlink, readFile } = require("fs/promises");
const { uploadResourceSchema } = require("../validators/resourceValidator");

const getResourcesByModule = async (req, res, next) => {
  try {
    const resources = await Resource.find({
      module: req.params.id
    }).sort({ order: 1 });

    res.status(200).json({
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      return next(error);
    }

    const { type, url, order } = req.body;
    const resource = await Resource.create({
      module: module._id,
      type,
      url,
      order,
    });

    res.status(201).json({
      status: 201,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      return next(error);
    }

    const result = uploadResourceSchema.safeParse(req.body);
    if (!result.success) {
      const error = new Error("Validation error");
      error.statusCode = 400;
      error.errors = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));
      throw error;
    }

    const module = await Module.findById(req.params.id);
    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      throw error;
    }

    const course = await Course.findById(module.course);
    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      throw error;
    }
    if (course.trainer.toString() !== req.user.id) {
      const error = new Error("You are not authorized to upload to this course");
      error.statusCode = 403;
      throw error;
    }

    const content = await readFile(req.file.path);
    let detectedMime;
    if (content.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
      detectedMime = "application/pdf";
    } else if (content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      detectedMime = "image/png";
    } else if (content.length >= 3 && content[0] === 255 && content[1] === 216 && content[2] === 255) {
      detectedMime = "image/jpeg";
    }
    if (!detectedMime || detectedMime !== req.file.mimetype) {
      const error = new Error("File content does not match an allowed file type");
      error.statusCode = 400;
      throw error;
    }

    const resource = await Resource.create({
      module: module._id,
      type: detectedMime === "application/pdf" ? "document" : "image",
      url: req.file.path,
      originalName: req.file.originalname,
      size: req.file.size,
      order: result.data.order,
    });

    res.status(201).json({
      status: 201,
      message: "Resource uploaded successfully",
      data: resource,
    });
  } catch (error) {
    if (req.file) {
      try {
        await unlink(req.file.path);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Failed to remove uploaded file:", cleanupError);
        }
      }
    }

    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.resourceId,
      module: req.params.id,
    });
    if (!resource) {
      const error = new Error("Resource not found in this module");
      error.statusCode = 404;
      return next(error);
    }

    const { type, url, order } = req.body;
    resource.type = type;
    resource.url = url;
    resource.order = order;
    await resource.save();

    res.status(200).json({
      status: 200,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.resourceId,
      module: req.params.id,
    });
    if (!resource) {
      const error = new Error("Resource not found in this module");
      error.statusCode = 404;
      return next(error);
    }

    const hasProgress = await ResourceProgress.exists({ resource: resource._id });
    if (hasProgress) {
      const error = new Error("Cannot delete resource with associated learner progress");
      error.statusCode = 409;
      return next(error);
    }

    await resource.deleteOne();
    res.status(200).json({
      status: 200,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResourcesByModule,
  createResource,
  uploadResource,
  updateResource,
  deleteResource,
};
