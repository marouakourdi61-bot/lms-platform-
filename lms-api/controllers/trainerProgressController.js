const {
    getTrainerCourses,
    getCourseLearners: getLearnersByCourse,
    getLearnerCourseProgress
} = require("../services/trainerProgressService");

const getMyCourses = async (req, res, next) => {
    try {
        const courses = await getTrainerCourses(
            req.user.id,
            req.query.status

        );

        res.status(200).json({
            message: "Cours du formateur récupérés avec succès",
            data: courses
        });
    } catch (error) {
        next(error);
    }
};

const getCourseLearners = async (req, res, next) => {
    try {
        const learners = await getLearnersByCourse(
            req.params.courseId,
            req.user.id
        );

        res.status(200).json({
            message: "Apprenants du cours récupérés avec succès",
            data: learners
        });
    } catch (error) {
        next(error);
    }
};

const getLearnerProgress = async ( req, res, next) => {
    try {
        const progress = await getLearnerCourseProgress(
            req.params.courseId,
            req.params.learnerId,
            req.user.id
        );

        res.status(200).json({
            message: "Progression de l'apprenant récupérée avec succès",
            data: progress
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getMyCourses,
    getCourseLearners,
    getLearnerProgress
};