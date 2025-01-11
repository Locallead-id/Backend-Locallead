import { transporter, htmlTemplate } from "../configs/nodemailer.config";

export const sendVerificationEmail = async (email: string, token: string) => {
  return await transporter.sendMail({
    from: "Locallead.id <no-reply@locallead.id>",
    to: email,
    subject: "Email Verification - Locallead.id",
    html: htmlTemplate(token),
  });
};
