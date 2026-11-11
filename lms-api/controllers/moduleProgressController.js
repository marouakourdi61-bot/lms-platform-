const Module = require("../models/Module");
const Enrollment = require("../models/Enrollment");
const ModuleProgress = require("../models/ModuleProgress");
const Resource = require("../models/Resource");
const ResourceProgress = require("../models/ResourceProgress");
const Quiz = require("../models/Quiz")
const QuizAttempt = require("../models/QuizAttempt")

const completeModule = async (req, res, next) => {
    try {
        const module = await Module.findById(req.params.moduleId);

        

        if (!module) {
            return res.status(404).json({
                status: 404,
                message: "Module introuvable"
            });
        }

        const enrollment = await Enrollment.findOne({
            learner: req.user.id,
            course: module.course,
            status: "active"
        });

        if (!enrollment) {
            return res.status(403).json({
                status: 403,
                message: "Vous n'êtes pas inscrit à ce cours"
            });
        }

        const previousModule = await Module.findOne({
            course: module.course,
            order: module.order - 1,
            status: "published"
        });

        if (previousModule) {
            const previousProgress = await ModuleProgress.findOne({
                learner: req.user.id,
                module: previousModule._id,
                status: "completed"
            });

            if (!previousProgress) {
                return res.status(403).json({
                    status: 403,
                    message: "Vous devez terminer le module précédent"
                });
            }


        }


        const resources = await Resource.find({
            module: module._id
        });

        const consultedResources = await ResourceProgress.countDocuments({
            learner: req.user.id,
            resource: { $in: resources.map(resource => resource._id) },
            consulted: true
        });

        if (consultedResources !== resources.length) {
            return res.status(400).json({
                status: 400,
                message: "Vous devez consulter toutes les ressources avant de terminer ce module"
            });
        }

        const requireQuiz = await Quiz.findOne({
            moduleId: module._id,
            isActive: true,
            isRequired: true
        })

        if(requireQuiz) {
            const passAttempt = await QuizAttempt.exists({
                learner: req.user.id,
                quiz: requireQuiz._id,
                passed: true
            })

            if(!passAttempt) {
                return res.status(400).json({
                    status: 400,
                    message: "You must pass the mandatory quiz before completing this module."
                })
            }
        }

        const progress = await ModuleProgress.findOneAndUpdate(
            {
                learner: req.user.id,
                module: module._id
            },
            {
                status: "completed",
                completedAt: new Date()
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json({
            message: "Module terminé avec succès",
            data: progress
        });



    } catch (error) {
        next(error);
    }
};

module.exports = {
    completeModule
};