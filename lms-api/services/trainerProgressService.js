const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Module = require("../models/Module");
const ModuleProgress = require("../models/ModuleProgress");
const Resource = require("../models/Resource");
const ResourceProgress = require("../models/ResourceProgress");

const getTrainerCourses = async(trainerId, status) =>{
    const filter = {
        trainer: trainerId
    };

    if(status){
        const allowedstatus = ["draft", "published", "archived"];

        if(!allowedstatus.includes(status)){
            const error = new Error("status du coure invalide");
            error.statusCode = 400;
            throw error;

        }
        
        filter.status = status;
    }

    return await Course.find(filter).sort({createdAt: -1});

};

const getCourseLearners = async (courseId, trainerId) => {
    const course = await Course.findOne({
        _id: courseId,
        trainer: trainerId
    });

    if (!course) {
        const error = new Error("Cours introuvable ou non autorisé");
        error.status = 404;
        throw error;
    }

    return await Enrollment.find({
        course: courseId,
         status: { $in: ["active", "completed"] }
    }).populate("learner", "name email");
};

const getLearnerCourseProgress = async(courseId, learnerId, trainerId) => {

     // verifier que le cours appartient au formateur
    const course = await Course.findOne({
        _id: courseId,
        trainer: trainerId
    });

    if (!course) {
        const error = new Error("Cours introuvable ou non autorisé");
        error.status = 404;
        throw error;
    }

     //verifier que l'apprenant est inscrit au cours
    const enrollment = await Enrollment.findOne({
        course: courseId,
        learner: learnerId,
        status: { $in: ["active", "completed"] }
    });

    if (!enrollment) {
        const error = new Error("Apprenant non inscrit à ce cours");
        error.status = 404;
        throw error;
    }

    //recupérer les modules publiés
    const modules = await Module.find({
        course: courseId,
        status: "published"
    }).sort({ order: 1 });

     //recupérer les modules terminés par l'apprenant
    const moduleProgress = await ModuleProgress.find({
        learner: learnerId,
        module: { $in: modules.map(module => module._id) },
        status: "completed"
    });

    //recupérer les ressources des modules
    const resources = await Resource.find({
        module: { $in: modules.map(module => module._id) }
    }).sort({ order: 1 });

    //recupérer les ressources consultées
    const resourceProgress = await ResourceProgress.find({
        learner: learnerId,
        resource: { $in: resources.map(resource => resource._id) },
        consulted: true
    });

    return {
        course: {
            id: course._id,
            title: course.title
        },

        learner: learnerId,

        enrollment: {
            status: enrollment.status,
            progress: enrollment.progress
        },

        modules: {
            total: modules.length,
            completed: moduleProgress.length,
            data: modules.map(module => ({
                id: module._id,
                title: module.title,
                order: module.order,
                completed: moduleProgress.some(
                    progress =>
                        progress.module.toString() === module._id.toString()
                )
            }))
        },

        resources: {
            total: resources.length,
            consulted: resourceProgress.length
        }
    };

};

module.exports = {
    getTrainerCourses,
    getCourseLearners,
    getLearnerCourseProgress
};

