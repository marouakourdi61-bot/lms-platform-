
const Module = require("../models/Module");
const ModuleProgress = require("../models/ModuleProgress");
const Enrollment = require("../models/Enrollment");
const { calculateCourseProgress } = require("./courseProgressService");

const getCourseResume = async (courseId, learnerId) => {
    // verifier l'inscription
    const enrollment = await Enrollment.findOne({
        course: courseId,
        learner: learnerId,
        status: { $in: ["active", "completed"] }
    });

    if (!enrollment) {
        const error = new Error("Vous n'êtes pas inscrit à ce cours");
        error.status = 403;
        throw error;
    }

    // recupérer les modules publiés dans l'ordre
    const modules = await Module.find({
        course: courseId,
        status: "published"
    }).sort({ order: 1 });

    // recupérer les modules terminés
    const completedProgress = await ModuleProgress.find({
        learner: learnerId,
        module: { $in: modules.map(module => module._id) },
        status: "completed"
    });

    const completedModuleIds = new Set(
        completedProgress.map(progress => progress.module.toString())
    );

    //trouver le premier module non terminé
    const currentIndex = modules.findIndex(
        module => !completedModuleIds.has(module._id.toString())
    );

    const currentModule =
        currentIndex === -1 ? null : modules[currentIndex];

    // identifier le module suivant
    const nextModule =
        currentIndex === -1
            ? null
            : modules[currentIndex + 1] || null;

    // calculer la progression globale
    const progress = await calculateCourseProgress(courseId, learnerId);

    return {
        courseId,
        currentModule,
        nextModule,
        courseCompleted: modules.length > 0 && currentModule === null,
        progress
    };
};

module.exports = { getCourseResume };
