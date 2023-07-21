import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { YUMMY_MAIL, YUMMY_PASS } = process.env;

const nodemailerConfig = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: YUMMY_MAIL,
    pass: YUMMY_PASS,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

export const sendEmail = async data => {
  const email = { ...data, from: YUMMY_MAIL };
  await transport.sendMail(email);
  return true;
};
