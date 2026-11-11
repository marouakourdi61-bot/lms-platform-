const Course = require("../models/Course");
const JobExecution = require("../models/JobExecution");

const getTrainerStats = async (trainerId) => {
    const courses = await Course.find({ trainer: trainerId })
        .select("_id title")
        .lean();

    const latestRefresh = await JobExecution.findOne({
        jobName: "statsRefresh",
        status: "success",
    })
        .sort({ finishedAt: -1 })
        .lean();

    if (!latestRefresh) {
        return {
            dataAvailable: false,
            refreshedAt: null,
            courses: [],
        };
    }

    const result = latestRefresh.result || {};

    const enrollmentsByCourse = new Map(
        (result.enrollmentsPerCourse || []).map((item) => [
            String(item._id),
            item.totalEnrollments,
        ])
    );

    const progressByCourse = new Map(
        (result.progressPerCourse || []).map((item) => [
            String(item._id),
            item.averageProgress,
        ])
    );

    const attemptsByCourse = new Map(
        (result.quizAttemptsPerCourse || []).map((item) => [
            String(item._id),
            item,
        ])
    );

    const feedbackByCourse = new Map(
        (result.feedbackPerCourse || []).map((item) => [
            String(item._id),
            item.feedbackCount,
        ])
    );

    return {
        dataAvailable: true,
        refreshedAt: latestRefresh.finishedAt,
        courses: courses.map((course) => {
            const courseId = String(course._id);
            const attemptStats = attemptsByCourse.get(courseId) || {};

            return {
                courseId,
                courseTitle: course.title,
                totalEnrollments: enrollmentsByCourse.get(courseId) || 0,
                averageProgress: Number(
                    (progressByCourse.get(courseId) || 0).toFixed(2)
                ),
                totalAttempts: attemptStats.totalAttempts || 0,
                passedAttempts: attemptStats.passedAttempts || 0,
                averageScore: Number(
                    (attemptStats.averageScore || 0).toFixed(2)
                ),
                feedbackCount: feedbackByCourse.get(courseId) || 0,
            };
        }),
    };
};

module.exports = { getTrainerStats };