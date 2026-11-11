
const logDriver = require("../services/email/logDriver");

describe("Email log driver", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("logs event and success without exposing secrets", async () => {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await logDriver.send({
      to: "test@example.com",
      subject: "Welcome",
      event: "user_registered",
      password: "secret-password",
      token: "secret-token",
    });

    const logLine = consoleSpy.mock.calls[0][1];
    const loggedEmail = JSON.parse(logLine);

    expect(consoleSpy.mock.calls[0][0]).toBe("[EMAIL]");
    expect(loggedEmail.event).toBe("user_registered");
    expect(loggedEmail.success).toBe(true);
    expect(logLine).not.toContain("secret-password");
    expect(logLine).not.toContain("secret-token");
  });
});
