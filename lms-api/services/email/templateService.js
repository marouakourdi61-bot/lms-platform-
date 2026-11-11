
const fs = require("fs");
const path = require("path");

const renderTemplate = (templateName, data = {}) => {
  const templatePath = path.join(
    __dirname,
    "../../templates/email",
    `${templateName}.html`
  );

  let html = fs.readFileSync(templatePath, "utf8");

  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, String(value));
  }

  return html;
};

module.exports = { renderTemplate };
