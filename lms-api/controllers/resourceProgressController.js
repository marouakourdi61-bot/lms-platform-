
const ResourceProgress = require("../models/ResourceProgress");
const Resource = require("../models/Resource");
const Module = require("../models/Module");
const Enrollment = require("../models/Enrollment");

const markResourceAsConsulted = async (req, res, next) => {
    try {
        const { resourceId } = req.params;
        const learnerId = req.user.id;

        // verifier que la ressource existe
        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({
                status: 404,
                message: "Ressource introuvable"
            });
        }

        // recupérer le module associé à la ressource
        const module = await Module.findById(resource.module);

        if (!module) {
            return res.status(404).json({
                status: 404,
                message: "Module introuvable"
            });
        }

        // verifier l'inscription active au cours
        const enrollment = await Enrollment.findOne({
            learner: learnerId,
            course: module.course,
            status: "active"
        });

        if (!enrollment) {
            return res.status(403).json({
                status: 403,
                message: "Vous n'êtes pas inscrit à ce cours"
            });
        }

        // verifier si la ressource est déjà consultée
        const existingProgress = await ResourceProgress.findOne({
            learner: learnerId,
            resource: resourceId
        });

        if (existingProgress) {
            return res.status(200).json({
                message: "Ressource déjà consultée",
                data: existingProgress
            });
        }

        // enregistrer la consultation
        const progress = await ResourceProgress.create({
            learner: learnerId,
            resource: resourceId,
            consulted: true,
            consultedAt: new Date()
        });

        return res.status(201).json({
            message: "Ressource marquée comme consultée",
            data: progress
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    markResourceAsConsulted
};
