const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const JobExecution = require("../models/JobExecution");
const { Feedback } = require("../models/Feedback");
const jobHandlers = require("../services/jobHandlers");
const { runJob } = require("../services/jobScheduler");
const { getTrainerStats } = require("../services/trainerStatsService");
const { useTestAccounts, domain } = require("./helpers/accounts");
const { createLearningFixture } = require("./helpers/learning");

describe("statsRefresh job", () => {
    useTestAccounts();

    let fixture;
    let quiz;
    let emptyCourse;
    let execution;

    beforeEach(async () => {
        fixture = await createLearningFixture();

        const password = await bcrypt.hash("Password123", 10);
        const extraLearners = await User.create([
            {
                name: "Stats learner one",
                email: `stats-one@${domain}`,
                password,
                role: "learner",
            },
            {
                name: "Stats learner two",
                email: `stats-two@${domain}`,
                password,
                role: "learner",
            },
        ]);

        emptyCourse = await Course.create({
            trainer: fixture.course.trainer,
            title: "Empty stats course",
            description: "Course without stats data",
            level: "beginner",
            category: "Development",
            estimatedDuration: 30,
            status: "published",
        });

        quiz = await Quiz.create({
            moduleId: fixture.modules[0]._id,
            title: "Statistics test quiz",
            passingScore: 60,
            questions: [
                {
                    id: "q1",
                    text: "Test question",
                    choices: [
                        { id: "a", text: "Correct answer" },
                        { id: "b", text: "Wrong answer" },
                    ],
                    correctChoiceId: "a",
                },
            ],
        });

        await Enrollment.create([
            {
                learner: fixture.learner._id,
                course: fixture.course._id,
                progress: 40,
            },
            {
                learner: extraLearners[0]._id,
                course: fixture.course._id,
                progress: 80,
            },
            {
                learner: extraLearners[1]._id,
                course: fixture.course._id,
                progress: 0,
            },
        ]);

        await QuizAttempt.create([
            {
                learner: fixture.learner._id,
                quiz: quiz._id,
                correctCount: 1,
                totalQuestions: 1,
                scorePercent: 100,
                passed: true,
            },
            {
                learner: extraLearners[0]._id,
                quiz: quiz._id,
                correctCount: 1,
                totalQuestions: 1,
                scorePercent: 60,
                passed: true,
            },
            {
                learner: extraLearners[1]._id,
                quiz: quiz._id,
                correctCount: 0,
                totalQuestions: 1,
                scorePercent: 20,
                passed: false,
            },
        ]);

        await Feedback.create([
            {
                trainer: fixture.course.trainer,
                learner: fixture.learner._id,
                course: fixture.course._id,
                module: fixture.modules[0]._id,
                comment: "First test feedback",
            },
            {
                trainer: fixture.course.trainer,
                learner: extraLearners[0]._id,
                course: fixture.course._id,
                module: fixture.modules[0]._id,
                comment: "Second test feedback",
            },
        ]);

        execution = await runJob("statsRefresh", jobHandlers.statsRefresh);
    });

    afterEach(async () => {
        if (mongoose.connection.name !== "lms_test") return;

        if (execution) {
            await JobExecution.deleteOne({ _id: execution._id });
        }

        if (!fixture) return;

        if (quiz) {
            await QuizAttempt.deleteMany({ quiz: quiz._id });
            await Quiz.deleteOne({ _id: quiz._id });
        }

        await Feedback.deleteMany({ course: fixture.course._id });

        await Enrollment.deleteMany({
            course: {
                $in: [fixture.course._id, emptyCourse?._id].filter(Boolean),
            },
        });

        if (emptyCourse) {
            await Course.deleteOne({ _id: emptyCourse._id });
        }
    });

    test("returns correct statistics and zero values for a course without data", async () => {
        const stats = await getTrainerStats(fixture.course.trainer.toString());

        const courseStats = stats.courses.find(
            (course) => course.courseId === fixture.course._id.toString()
        );

        expect(stats.dataAvailable).toBe(true);
        expect(courseStats).toMatchObject({
            totalEnrollments: 3,
            averageProgress: 40,
            totalAttempts: 3,
            passedAttempts: 2,
            averageScore: 60,
            feedbackCount: 2,
        });

        const emptyCourseStats = stats.courses.find(
            (course) => course.courseId === emptyCourse._id.toString()
        );

        expect(emptyCourseStats).toMatchObject({
            totalEnrollments: 0,
            averageProgress: 0,
            totalAttempts: 0,
            passedAttempts: 0,
            averageScore: 0,
            feedbackCount: 0,
        });
    });
});