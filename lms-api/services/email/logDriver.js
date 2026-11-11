
const send = async ({ to, subject,text,html ,event }) => {
  const emailLog = {
    driver: "log",
    event: event || "unspecified",
    recipient: to,
    subject,
    text: text || null,
    html: html || null,
    timestamp: new Date().toISOString(),
    success: true,
  };

  console.log("[EMAIL]", JSON.stringify(emailLog, null, 2));

  return {
    success: true,
    driver: "log",
    event: emailLog.event,
    timestamp: emailLog.timestamp,
  };
};

module.exports = { send };
