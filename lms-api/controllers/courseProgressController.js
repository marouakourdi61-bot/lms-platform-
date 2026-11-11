const { calculateCourseProgress } = require("../services/courseProgressService");

const getCourseProgress = async (req, res, next) => {
    try {
        const progress = await calculateCourseProgress(
            req.params.courseId,
            req.user.id
        );

        res.status(200).json({
            message: "Progression du cours récupérée avec succès",
            data: progress
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCourseProgress };