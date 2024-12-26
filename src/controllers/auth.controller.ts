import { NextFunction, Response, Request } from "express";
import prisma from "../database/prisma";
import { compareHashedPassword, hashPassword } from "../helpers/bcrypt";
import { signToken } from "../helpers/jwt";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };

      const user = await prisma.user.findFirst({ where: { email } });
      if (user) throw { name: "BadRequestExists" };

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
      res.status(201).json({ message: "User created successfully", data: sanitizedUser });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };

      const foundUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!foundUser) throw { name: "Unauthorized" };
      if (!compareHashedPassword(password, foundUser.password)) throw { name: "Unauthorized" };

      res.status(200).json({ message: "Successfully login", access_token: signToken({ id: String(foundUser.id), role: foundUser.role }) });
    } catch (err) {
      next(err);
    }
  }

  // static async verifyAccount(req: Request, res: Response, next: NextFunction) {
  //   try {

  //   } catch (err) {
  //     next(err);
  //   }
  // }
}
