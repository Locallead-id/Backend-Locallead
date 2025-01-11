import nodemailer from "nodemailer";
const CLIENT_EMAIL = process.env.CLIENT_EMAIL as string;
const CLIENT_PASSWORD = process.env.CLIENT_PASSWORD as string;
const BACKEND_URL = process.env.BACKEND_URL as string;

// Use Gmail as a transport service
export const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: CLIENT_EMAIL,
    pass: CLIENT_PASSWORD,
  },
});

export const htmlTemplate = (token: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Locallead.id</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #d9534f;
            font-size: 24px;
            margin: 0;
        }
        .content {
            text-align: center;
            margin-bottom: 20px;
        }
        .content p {
            color: #333333;
            font-size: 16px;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #d9534f;
            color: #ffffff;
            text-decoration: none;
            font-size: 16px;
            border-radius: 4px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #777777;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Locallead.id</h1>
        </div>
        <div class="content">
            <p>Thank you for signing up with Locallead.id! To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${BACKEND_URL}/auth/verify/${token}" class="button">Verify Email</a>
        </div>
        <div class="footer">
            <p>If you did not sign up for an account with Locallead.id, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
`;
