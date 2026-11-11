
const NotificationConfig = require("../models/NotificationConfig");
const {
    getNotificationConfig,
} = require("../services/notificationConfigService");

describe("notificationConfigService", () => {
    afterEach(async () => {
        await NotificationConfig.deleteMany({ key: "global" });
    });

    it("creates and returns the default configuration when none exists", async () => {
        const config = await getNotificationConfig();

        expect(config.key).toBe("global");
        expect(config.notifications.enabled).toBe(true);
        expect(config.notifications.emailDriver).toBe("log");
        expect(config.jobs.inactiveLearnerReminder.enabled).toBe(false);
    });

    it("returns the stored configuration", async () => {
        await NotificationConfig.create({
            key: "global",
            notifications: {
                enabled: false,
                emailDriver: "log",
            },
        });

        const config = await getNotificationConfig();

        expect(config.notifications.enabled).toBe(false);
        expect(config.notifications.emailDriver).toBe("log");
    });
});
