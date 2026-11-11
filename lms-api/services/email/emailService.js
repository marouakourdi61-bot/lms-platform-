
const logDriver = require("./logDriver");
const { renderTemplate } = require("./templateService");
const { getNotificationConfig } = require("../notificationConfigService");

const sandboxDriver = require("./smtpDriver");

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  template,
  data = {},
  event = "unspecified",
}) => {
  if (!to || !subject) {
    throw new Error("Le destinataire et le sujet sont obligatoires.");
  }

  const config = await getNotificationConfig();
  const notifications = config.notifications;

  if (notifications?.enabled === false) {
    return {
      success: true,
      skipped: true,
      reason: "notifications_disabled",
    };
  }

  if (template) {
    html = renderTemplate(template, data);
  }

  const driver = notifications?.emailDriver || "log";

  const email = {
    to,
    subject,
    text,
    html,
    event,
  };

  if (driver === "log") {
    return logDriver.send(email);
  }

  if (driver === "sandbox") {
  return sandboxDriver.send(email);
}

  throw new Error(`EMAIL_DRIVER non pris en charge : ${driver}`);
};

module.exports = { sendEmail };
