const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For development, we can use Ethereal or just log to console if no env vars
    // But for this task, I'll assume we might want to use a real service or a helper
    // If no env vars, I'll log to console to avoid crashing

    if (!process.env.SMTP_HOST) {
        console.log('No SMTP_HOST defined. Email would have been sent to:', options.email);
        console.log('Subject:', options.subject);
        console.log('Message:', options.message);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`, // "Voltify" <email@gmail.com>
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Add HTML support
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
