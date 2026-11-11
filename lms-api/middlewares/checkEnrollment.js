const Enrollment = require("../models/Enrollment");

const checkEnrollment = async (req, res, next) => {
    try {
        const enrollment = await Enrollment.findOne({
            learner: req.user.id,
            course: req.params.id,
            status: "active"
        });

        if (!enrollment) {
            return res.status(403).json({
                status: 403,
                message: "Vous n'êtes pas inscrit à ce cours"
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = checkEnrollment;