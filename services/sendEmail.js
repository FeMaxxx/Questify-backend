import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { BASE_SITE_URL, SMTP_HOST, SMTP_PORT, VOCABULARY_MAIL, VOCABULARY_PASS } = process.env;

const nodemailerConfig = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: VOCABULARY_MAIL,
    pass: VOCABULARY_PASS,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

export const sendActivationMail = async (to, verificationCode) => {
  await transport.sendMail({
    from: VOCABULARY_MAIL,
    to,
    subject: "Verify email",
    html: `
      <div style="padding: 10px; fontFamily: Arial, sans-serif; color: #000">
        <h1 style="color: #ffb74b; marginBottom: 20px;">
          Verify Your Email
        </h1>
        <p style="marginBottom: 15px">
          To verify your email, enter this code - <strong style="color: #ffb74b; margin-left: 5px">${verificationCode}</strong>
        </p>
        <p>
          Or follow this link - <a target="_blank" href="${BASE_SITE_URL}/verification/${verificationCode}" style="color: #ffb74b">Verify Email</a>.
        </p>
      </div>
    `,
  });
};
