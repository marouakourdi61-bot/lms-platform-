const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const { sendEmail } = require("../services/email/emailService");

const enrollInCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        // verifier que le cours existe
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                status: 404,
                message: "Cours introuvable"
            });
        }


        // verifier que cours est publié
        if (course.status !== "published") {
            return res.status(400).json({
                status: 400,
                message: "Impossible de s'inscrire à un cours non publié"
            });
        }

        // verifier apprenant est déja inscrit
        const existingEnrollment = await Enrollment.findOne({
            learner: req.user.id,
            course: courseId,
            status: "active"
        });

        if (existingEnrollment) {
            return res.status(409).json({
                status: 409,
                message: "Vous êtes déjà inscrit à ce cours"
            });
        }

        const learner = await User.findById(req.user.id);
        if (!learner) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }
        
        // Créer l'inscription
        const enrollment = await Enrollment.create({
            learner: req.user.id,
            course: courseId
        });
        // envoyer email confirmation
        try {
            await sendEmail({
                to: learner.email,
                subject: "Confirmation d'inscription au cours",
                template: "enrollment",
                data: {
                    name: learner.name,
                    course: course.title
                },
                event: "course_enrolled"
            });
        } catch (emailError) {
            console.error(
                "Échec de l'email course_enrolled:",
                emailError.message
            );
        }

        return res.status(201).json({
            message: "Inscription réussie",
            enrollment
        });

    } catch (error) {
        next(error);
    }
};


const getMyEnrollments = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find({
            learner: req.user.id
        }).populate("course");

        return res.status(200).json(enrollments);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    enrollInCourse,
    getMyEnrollments
};