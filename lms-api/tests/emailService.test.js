
const emailService = require("../services/email/emailService");
const logDriver = require("../services/email/logDriver");
const sandboxDriver = require("../services/email/smtpDriver");
const NotificationConfig = require("../models/NotificationConfig");

describe("Email service", () => {
  const originalDriver = process.env.EMAIL_DRIVER;

  afterEach(async () => {
    jest.restoreAllMocks();

    if (originalDriver === undefined) {
      delete process.env.EMAIL_DRIVER;
    } else {
      process.env.EMAIL_DRIVER = originalDriver;
    }

    await NotificationConfig.deleteMany({ key: "global" });
  });

  test("uses the log driver when configured", async () => {
    await NotificationConfig.findOneAndUpdate(
      { key: "global" },
      {
        $set: {
          "notifications.enabled": true,
          "notifications.emailDriver": "log",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const sendSpy = jest
      .spyOn(logDriver, "send")
      .mockResolvedValue({ success: true });

    await emailService.sendEmail({
      to: "test@example.com",
      subject: "Test email",
      event: "user_registered",
    });

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Test email",
        event: "user_registered",
      })
    );
  });

  test("rejects an unsupported driver", async () => {
    await NotificationConfig.findOneAndUpdate(
      { key: "global" },
      {
        $set: {
          "notifications.enabled": true,
          "notifications.emailDriver": "unknown",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await expect(
      emailService.sendEmail({
        to: "test@example.com",
        subject: "Test email",
      })
    ).rejects.toThrow("EMAIL_DRIVER non pris en charge : unknown");
  });

  test("uses the sandbox driver when configured", async () => {
    await NotificationConfig.findOneAndUpdate(
      { key: "global" },
      {
        $set: {
          "notifications.enabled": true,
          "notifications.emailDriver": "sandbox",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const sendSpy = jest
      .spyOn(sandboxDriver, "send")
      .mockResolvedValue({
        success: true,
        driver: "sandbox",
        event: "user_registered",
      });

    await emailService.sendEmail({
      to: "test@example.com",
      subject: "Test email",
      event: "user_registered",
    });

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Test email",
        event: "user_registered",
      })
    );
  });

  test("does not send email when notifications are disabled", async () => {
    await NotificationConfig.findOneAndUpdate(
      { key: "global" },
      {
        $set: {
          "notifications.enabled": false,
          "notifications.emailDriver": "log",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const sendSpy = jest.spyOn(logDriver, "send");

    const result = await emailService.sendEmail({
      to: "test@example.com",
      subject: "Test email",
    });

    expect(sendSpy).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      skipped: true,
      reason: "notifications_disabled",
    });
  });
});
