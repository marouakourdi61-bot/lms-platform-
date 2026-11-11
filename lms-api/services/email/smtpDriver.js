
const nodemailer = require("nodemailer");

const send = async ({ to, subject, text, html, event }) => {
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        EMAIL_FROM,
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
        throw new Error(
            "Configuration SMTP incomplète. Vérifiez les variables d'environnement."
        );
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        text,
        html,
    });

    const result = {
        success: true,
        driver: "sandbox",
        event: event || "unspecified",
        subject,
        text: text || null,
        html: html || null,
        messageId: info.messageId,
        timestamp: new Date().toISOString(),
    };

    console.log("[EMAIL]", JSON.stringify(result, null, 2));

    return result;
};

module.exports = { send };
