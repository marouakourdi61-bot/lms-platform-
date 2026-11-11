const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const ModuleProgress = require("../models/ModuleProgress");
const ResourceProgress = require("../models/ResourceProgress");
const Quiz = require("../models/Quiz");
const { getNotificationConfig } = require("./notificationConfigService");
const { sendEmail } = require("./email/emailService");
const Module = require("../models/Module")
const QuizAttempt = require("../models/QuizAttempt")
const { Feedback } = require("../models/Feedback")

const {
    getPreferences,
} = require("./trainerSummaryPreferenceService");

const jobHandlers = {
    inactiveLearnerReminder: async () => {
        console.log("[JOB] inactiveLearnerReminder executed");

        const config = await getNotificationConfig();
        const jobConfig = config.jobs?.inactiveLearnerReminder;

        if (!jobConfig?.enabled) {
            return {
                message: "Inactive learner reminders are disabled",
                sent: 0,
            };
        }

        const inactiveDays = jobConfig.inactiveDays || 7;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

        const enrollments = await Enrollment.find({
            status: "active",
        }).populate("learner", "name email status");

        let sent = 0;
        let skipped = 0;
        const errors = [];

        for (const enrollment of enrollments) {
            const learner = enrollment.learner;

            if (!learner || learner.status !== "active") {
                skipped++;
                continue;
            }

            const [moduleActivity, resourceActivity] = await Promise.all([
                ModuleProgress.findOne({
                    learner: learner._id,
                    updatedAt: { $gte: cutoffDate },
                }).select("_id"),
                ResourceProgress.findOne({
                    learner: learner._id,
                    $or: [
                        { consultedAt: { $gte: cutoffDate } },
                        { updatedAt: { $gte: cutoffDate } },
                    ],
                }).select("_id"),
            ]);

            if (moduleActivity || resourceActivity) {
                skipped++;
                continue;
            }

            try {
                const result = await sendEmail({
                    to: learner.email,
                    subject: "Reprenez votre apprentissage !",
                    template: "inactiveLearnerReminder",
                    data: {
                        name: learner.name,
                        inactiveDays,
                    },
                    event: "inactive_learner_reminder",
                });

                if (result?.skipped) {
                    skipped++;
                } else {
                    sent++;
                }
            } catch (error) {
                errors.push({
                    learnerId: learner._id.toString(),
                    message: error.message,
                });
            }
        }

        console.log(
            `[JOB] inactiveLearnerReminder completed: ${sent} sent, ${skipped} skipped`
        );

        return {
            message: "Inactive learner reminders processed",
            inactiveDays,
            sent,
            skipped,
            errors,
        };
    },
    trainerSummary: async () => {
        console.log("[JOB] trainerSummary executed");

        const trainers = await User.find({
            role: "trainer",
            status: "active",
        }).select("_id name email");

        const summaries = [];

        for (const trainer of trainers) {
            const preferences = await getPreferences(trainer._id);

            //ne pas envoyer le résumé si formateur n'est pas abonnee
            if (!preferences.subscribedToSummary) {
                console.log(
                    `[JOB] trainerSummary skipped for ${trainer.email}: not subscribed`
                );
                continue;
            }

            const courseFilter = {
                trainer: trainer._id,
            };

            const excludedStatuses = [];

            if (!preferences.includeDraftCourses) {
                excludedStatuses.push("draft");
            }

            if (!preferences.includeArchivedCourses) {
                excludedStatuses.push("archived");
            }

            if (excludedStatuses.length > 0) {
                courseFilter.status = {
                    $nin: excludedStatuses,
                };
            }

            const courses = await Course.find(courseFilter)
                .select("_id title status");

            const courseIds = courses.map((course) => course._id);

            const summary = {
                trainerId: trainer._id,
                trainerName: trainer.name,
                trainerEmail: trainer.email,
                courses: courses.map((course) => ({
                    id: course._id,
                    title: course.title,
                    status: course.status,
                })),
            };

            let enrollmentStats = [];
            let progressStats = [];

            if (
                preferences.includeEnrollmentStats &&
                courseIds.length > 0
            ) {
                enrollmentStats = await Enrollment.aggregate([
                    {
                        $match: {
                            course: { $in: courseIds },
                        },
                    },
                    {
                        $group: {
                            _id: "$course",
                            totalEnrollments: { $sum: 1 },
                        },
                    },
                ]);

                summary.enrollmentStats = enrollmentStats;
            }

            if (
                preferences.includeProgressStats &&
                courseIds.length > 0
            ) {
                progressStats = await Enrollment.aggregate([
                    {
                        $match: {
                            course: { $in: courseIds },
                        },
                    },
                    {
                        $group: {
                            _id: "$course",
                            averageProgress: { $avg: "$progress" },
                        },
                    },
                ]);

                summary.progressStats = progressStats;
            }

            summaries.push(summary);

            try {
                await sendEmail({
                    to: trainer.email,
                    subject: "Votre résumé formateur",
                    template: "trainerSummary",
                    data: {
                        name: trainer.name,
                        courseCount: courses.length,

                        enrollmentStats: preferences.includeEnrollmentStats
                            ? enrollmentStats
                                .map(
                                    (stat) =>
                                        `Cours ${stat._id}: ${stat.totalEnrollments} inscriptions`
                                )
                                .join("<br>")
                            : "Statistiques des inscriptions désactivées.",

                        progressStats: preferences.includeProgressStats
                            ? progressStats
                                .map(
                                    (stat) =>
                                        `Cours ${stat._id}: ${stat.averageProgress.toFixed(1)} %`
                                )
                                .join("<br>")
                            : "Statistiques de progression désactivées.",
                    },
                    event: "trainer_summary",
                });
            } catch (error) {
                console.error(
                    `[JOB EMAIL FAILED] trainerSummary for ${trainer.email}:`,
                    error.message
                );
            }
        }

        console.log(
            `[JOB] trainerSummary completed for ${summaries.length} trainers`
        );

        return {
            message: "Trainer summaries generated successfully",
            count: summaries.length,
            summaries,
        };
    },


    statsRefresh: async () => {
        console.log("[JOB] statsRefresh executed");

        const [
            enrollmentsPerCourse,
            progressPerCourse,
            quizAttemptsPerCourse,
            feedbackPerCourse,
            totalQuizzes,
            activeQuizzes,
        ] = await Promise.all([
            Enrollment.aggregate([
                {
                    $group: {
                        _id: "$course",
                        totalEnrollments: { $sum: 1 },
                    },
                },
            ]),

            Enrollment.aggregate([
                {
                    $group: {
                        _id: "$course",
                        averageProgress: { $avg: "$progress" },
                    },
                },
            ]),

            QuizAttempt.aggregate([
                {
                    $lookup: {
                        from: Quiz.collection.name,
                        localField: "quiz",
                        foreignField: "_id",
                        as: "quiz",
                    },
                },
                { $unwind: "$quiz" },
                {
                    $lookup: {
                        from: Module.collection.name,
                        localField: "quiz.moduleId",
                        foreignField: "_id",
                        as: "module",
                    },
                },
                { $unwind: "$module" },
                {
                    $group: {
                        _id: "$module.course",
                        totalAttempts: { $sum: 1 },
                        passedAttempts: {
                            $sum: { $cond: ["$passed", 1, 0] },
                        },
                        averageScore: { $avg: "$scorePercent" },
                    },
                },
            ]),

            Feedback.aggregate([
                {
                    $group: {
                        _id: "$course",
                        feedbackCount: { $sum: 1 },
                    },
                },
            ]),

            Quiz.countDocuments(),

            Quiz.countDocuments({ isActive: true }),
        ]);

        const result = {
            message: "Statistics refreshed successfully",
            generatedAt: new Date().toISOString(),
            enrollmentsPerCourse,
            progressPerCourse,
            quizAttemptsPerCourse,
            feedbackPerCourse,
            quizzes: {
                total: totalQuizzes,
                active: activeQuizzes,
            },
        };

        console.log("[JOB] statsRefresh completed");

        return result;
    },

};

module.exports = jobHandlers;
