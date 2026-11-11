jest.mock("../models/User", () => ({
    find: jest.fn(),
}));

jest.mock("../models/Course", () => ({
    find: jest.fn(),
}));

jest.mock("../models/Enrollment", () => ({
    aggregate: jest.fn(),
}));

jest.mock("../services/trainerSummaryPreferenceService", () => ({
    getPreferences: jest.fn(),
}));

const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { getPreferences } = require("../services/trainerSummaryPreferenceService");
const jobHandlers = require("../services/jobHandlers");

describe("trainerSummary job", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "log").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("exclut les cours brouillons et archivés selon les préférences", async () => {
        const trainerId = "trainer-123";

        User.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([
                {
                    _id: trainerId,
                    name: "Test Trainer",
                    email: "trainer@example.com",
                },
            ]),
        });

        getPreferences.mockResolvedValue({
            subscribedToSummary: true,
            includeDraftCourses: false,
            includeArchivedCourses: false,
            includeEnrollmentStats: false,
            includeProgressStats: false,
        });

        const courses = [
            {
                _id: "course-1",
                title: "Cours publié",
                status: "published",
            },
        ];

        Course.find.mockReturnValue({
            select: jest.fn().mockResolvedValue(courses),
        });

        const result = await jobHandlers.trainerSummary();

        expect(Course.find).toHaveBeenCalledWith({
            trainer: trainerId,
            status: { $nin: ["draft", "archived"] },
        });

        expect(Enrollment.aggregate).not.toHaveBeenCalled();
        expect(result.count).toBe(1);
        expect(result.summaries[0].courses).toEqual([
            {
                id: "course-1",
                title: "Cours publié",
                status: "published",
            },
        ]);
        expect(result.summaries[0]).not.toHaveProperty("enrollmentStats");
        expect(result.summaries[0]).not.toHaveProperty("progressStats");
    });

    it("inclut les statistiques lorsque les préférences les autorisent", async () => {
        User.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([
                {
                    _id: "trainer-456",
                    name: "Trainer Two",
                    email: "trainer2@example.com",
                },
            ]),
        });

        getPreferences.mockResolvedValue({
            subscribedToSummary: true,
            includeDraftCourses: true,
            includeArchivedCourses: true,
            includeEnrollmentStats: true,
            includeProgressStats: true,
        });

        Course.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([
                {
                    _id: "course-2",
                    title: "Cours brouillon",
                    status: "draft",
                },
            ]),
        });

        Enrollment.aggregate
            .mockResolvedValueOnce([
                { _id: "course-2", totalEnrollments: 3 },
            ])
            .mockResolvedValueOnce([
                { _id: "course-2", averageProgress: 75 },
            ]);

        const result = await jobHandlers.trainerSummary();

        expect(Course.find).toHaveBeenCalledWith({
            trainer: "trainer-456",
        });
        expect(Enrollment.aggregate).toHaveBeenCalledTimes(2);
        expect(result.summaries[0].enrollmentStats).toEqual([
            { _id: "course-2", totalEnrollments: 3 },
        ]);
        expect(result.summaries[0].progressStats).toEqual([
            { _id: "course-2", averageProgress: 75 },
        ]);
    });

    it("récupère les préférences séparément pour chaque formateur", async () => {
        User.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([
                {
                    _id: "trainer-1",
                    name: "Trainer One",
                    email: "one@example.com",
                },
                {
                    _id: "trainer-2",
                    name: "Trainer Two",
                    email: "two@example.com",
                },
            ]),
        });

        getPreferences
            .mockResolvedValueOnce({
                subscribedToSummary: true,
                includeDraftCourses: false,
                includeArchivedCourses: false,
                includeEnrollmentStats: false,
                includeProgressStats: false,
            })
            .mockResolvedValueOnce({
                subscribedToSummary: true,
                includeDraftCourses: true,
                includeArchivedCourses: false,
                includeEnrollmentStats: false,
                includeProgressStats: false,
            });

        Course.find
            .mockReturnValueOnce({
                select: jest.fn().mockResolvedValue([]),
            })
            .mockReturnValueOnce({
                select: jest.fn().mockResolvedValue([]),
            });

        const result = await jobHandlers.trainerSummary();

        expect(getPreferences).toHaveBeenNthCalledWith(1, "trainer-1");
        expect(getPreferences).toHaveBeenNthCalledWith(2, "trainer-2");
        expect(Course.find).toHaveBeenNthCalledWith(1, {
            trainer: "trainer-1",
            status: { $nin: ["draft", "archived"] },
        });
        expect(Course.find).toHaveBeenNthCalledWith(2, {
            trainer: "trainer-2",
            status: { $nin: ["archived"] },
        });
        expect(result.count).toBe(2);
    });
});
