const Module = require("../models/Module");
const Resource = require("../models/Resource");
const ModuleProgress = require("../models/ModuleProgress");
const ResourceProgress = require("../models/ResourceProgress");
const Enrollment = require("../models/Enrollment");


const calculateCourseProgress = async (courseId, learnerId) => {

    //verification d inscription active

    const enrollment = await Enrollment.findOne({
        course: courseId,
        learner: learnerId,
        status: { $in: ["active", "completed"] }
    });

    if (!enrollment) {
        const error = new Error("Inscription active introuvable");
        error.status = 404;
        throw error;
    }

    // récuperer les modules publier du coures
    const modules = await Module.find({
        course: courseId,
        status: "published"
    });

    const moduleIds = modules.map(module => module._id);

    //récuperer les ressources de ses module
    const resources = await Resource.find({
        module: { $in: moduleIds }
    });

    const resourceIds = resources.map(resource => resource._id);

    // compter les modules terminer
    const completedModules = await ModuleProgress.countDocuments({
        learner: learnerId,
        module: { $in: moduleIds },
        status: "completed"
    });

    //compter progresion globale
    const consultedResources = await ResourceProgress.countDocuments({
        learner: learnerId,
        resource: { $in: resourceIds },
        consulted: true
    });

    //calculer progresion globale
    const totalItems = modules.length + resources.length;
    const completedItems = completedModules + consultedResources;

    const percentage = totalItems === 0
        ? 0
        : Math.round((completedItems / totalItems) * 10000) / 100;



    enrollment.progress = percentage;

    if (percentage === 100) {
        enrollment.status = "completed";
    }

    await enrollment.save();

    return {
        courseId,
        learnerId,
        totalModules: modules.length,
        completedModules,
        totalResources: resources.length,
        consultedResources,
        percentage,
        enrollmentStatus: enrollment.status
    };


};

module.exports = { calculateCourseProgress };