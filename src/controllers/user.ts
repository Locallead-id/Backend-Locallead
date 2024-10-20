import { Response, NextFunction } from "express";
import { compareHashedPassword } from "../helpers/bcrypt";
import { signToken } from "../helpers/jwt";
import prisma from "../database/prisma";
import { AuthRequest } from "../types/types";

export class UserController {
  static async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };

      const createdUser = await prisma.user.create({
        data: {
          email,
          password,
          role: "USER",
          profile: {
            create: {
              fullName: name,
            },
          },
        },
      });

      res.status(201).json({ id: createdUser.id, email, name });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };

      // Find One User Data
      const foundUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!foundUser) {
        throw { name: "Unauthorized" };
      }
      if (!compareHashedPassword(password, foundUser.password)) {
        throw { name: "Unauthorized" };
      }
      const access_token = signToken({ id: String(foundUser.id) });
      res.status(200).json({ access_token });
    } catch (err) {
      next(err);
    }
  }

  // static async template(req: AuthRequest, res: Response, next: NextFunction) {
  //   try {

  //   } catch (err) {
  //     next(err)
  //   }
  // }
}
