
jest.mock("node-cron", () => ({
    validate: jest.fn(() => true),
    schedule: jest.fn(() => ({
        stop: jest.fn(),
    })),
}));

jest.mock("../services/notificationConfigService", () => ({
    getNotificationConfig: jest.fn(),
}));

const cron = require("node-cron");
const {
    getNotificationConfig,
} = require("../services/notificationConfigService");

const {
    refreshJobSchedules,
    stopJobSchedules,
} = require("../services/jobScheduler");

describe("jobScheduler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        stopJobSchedules();
    });

    it("registers enabled jobs with valid frequencies", async () => {
        getNotificationConfig.mockResolvedValue({
            jobs: {
                inactiveLearnerReminder: {
                    enabled: true,
                    frequency: "0 9 * * *",
                },
                trainerSummary: {
                    enabled: false,
                    frequency: "0 10 * * 1",
                },
                statsRefresh: {
                    enabled: true,
                    frequency: "0 * * * *",
                },
            },
        });

        const handlers = {
            inactiveLearnerReminder: jest.fn(),
            trainerSummary: jest.fn(),
            statsRefresh: jest.fn(),
        };

        await refreshJobSchedules(handlers);

        expect(cron.schedule).toHaveBeenCalledTimes(2);
        expect(cron.schedule).toHaveBeenCalledWith(
            "0 9 * * *",
            expect.any(Function),
            { timezone: "Africa/Casablanca" }
        );
        expect(cron.schedule).toHaveBeenCalledWith(
            "0 * * * *",
            expect.any(Function),
            { timezone: "Africa/Casablanca" }
        );
    });

    it("does not register jobs that are disabled", async () => {
        getNotificationConfig.mockResolvedValue({
            jobs: {
                inactiveLearnerReminder: {
                    enabled: false,
                    frequency: "0 9 * * *",
                },
                trainerSummary: {
                    enabled: false,
                    frequency: "0 10 * * 1",
                },
                statsRefresh: {
                    enabled: false,
                    frequency: "0 * * * *",
                },
            },
        });

        await refreshJobSchedules({
            inactiveLearnerReminder: jest.fn(),
            trainerSummary: jest.fn(),
            statsRefresh: jest.fn(),
        });

        expect(cron.schedule).not.toHaveBeenCalled();
    });
});
