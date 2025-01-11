import { NextFunction, Response, Request } from "express";

import prisma from "../database/prisma";
import { compareHashedPassword, hashPassword } from "../helpers/bcrypt";
import { generateVericationToken, signToken, decodeVerificationToken } from "../helpers/jwt";
import { sendVerificationEmail } from "../services/nodemailer.service";
import { emailValidator } from "../helpers/emailValidator";
import { AuthRequest } from "../types/types";

const FRONTEND_URL = process.env.FRONTEND_URL as string;
export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };

      const user = await prisma.user.findFirst({ where: { email } });
      if (user) throw { name: "BadRequestExists" };

      if (!emailValidator(email)) throw { name: "InvalidEmail" };

      let createdUser = await prisma.user.create({
        data: {
          email,
          password: hashPassword(password),
          profile: {
            create: {
              fullName: name,
            },
          },
        },
      });
      const { password: pass, ...sanitizedUser } = createdUser || {};

      const token = generateVericationToken(email);
      await sendVerificationEmail(email, token);

      res.status(201).json({ message: "User created successfully. Please check your email to verify your account", data: sanitizedUser });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };
      if (!emailValidator(email)) throw { name: "InvalidEmail" };

      const foundUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!foundUser) throw { name: "Unauthorized" };
      if (!compareHashedPassword(password, foundUser.password)) throw { name: "Unauthorized" };

      await prisma.userSession.create({
        data: {
          userId: foundUser.id,
          ipAddress: req.ip as string,
          deviceInfo: req.headers["user-agent"],
        },
      });

      res.status(200).json({ message: "Successfully login", access_token: signToken({ id: String(foundUser.id), role: foundUser.role }) });
    } catch (err) {
      next(err);
    }
  }

  static async resendVerificationEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

      if (!user) throw { name: "DataNotFound" };
      if (user.isVerified) throw { name: "BadRequest" };

      const token = generateVericationToken(user.email);
      await sendVerificationEmail(user.email, token);

      console.log(`Verification email sent to ${user.email}`);

      res.status(200).json({ message: `Verification email sent successfully to ${user.email}` });
    } catch (err) {
      next(err);
    }
  }

  static async verifyAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;

      if (!token) throw { name: "BadRequest" };

      const decoded = decodeVerificationToken(token) as { email: string; iat: number };
      if (!decoded) throw { name: "InvalidToken" };

      const { email } = decoded;

      const user = await prisma.user.update({
        where: { email },
        data: {
          isVerified: true,
        },
      });

      if (!user) throw { name: "DataNotFound" };

      console.log(`User ${email} is verified successfully`);

      res.redirect(`${FRONTEND_URL}/verified?email=${email}`);
    } catch (err) {
      next(err);
    }
  }
}
