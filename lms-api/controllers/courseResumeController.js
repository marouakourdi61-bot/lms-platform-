const { getCourseResume } = require("../services/courseResumeService");

const resumeCourse = async (req, res, next) =>{
    try{
        const data =  await getCourseResume(
            req.params.courseId,
            req.user.id
        );

        res.status(200).json({
            message: "Reprise du cours récupérée avec succès",
            data
        });
    } catch (error) {
        next(error);
    }

    };

    module.exports = {resumeCourse };
