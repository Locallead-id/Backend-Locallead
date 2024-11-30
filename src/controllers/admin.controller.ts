import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";
import { hashPassword } from "../helpers/bcrypt";

export class AdminController {
  // static async template(req: AuthRequest, res: Response, next: NextFunction) {
  //   try {
  //   } catch (err) {
  //     next(err);
  //   }
  // }
  static async createUserAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, name, jobTitle } = req.body;
      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };

      const createdUser = await prisma.user.create({
        data: {
          email,
          password: hashPassword(password),
          role: "USER",
          profile: {
            create: {
              fullName: name,
              jobTitle,
            },
          },
        },
      });

      res.status(201).json({ message: "User created successfully by admin", data: createdUser });
    } catch (err) {
      next(err);
    }
  }

  static async updateUserAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, password, name, jobTitle, address, dateOfBirth, imageUrl, jobDepartment, jobBranch } = req.body;

      const foundUser = await prisma.user.findFirst({ where: { id: Number(id) } });
      if (!foundUser) throw { name: "DataNotFound" };

      const updatedUser = await prisma.user.update({
        data: {
          email,
          password: hashPassword(password),
          profile: {
            update: {
              data: {
                fullName: name,
                jobTitle,
                address,
                dateOfBirth,
                imageUrl,
                jobDepartment,
                jobBranch,
              },
            },
          },
        },
        where: { id: Number(id) },
      });

      res.status(200).json({ message: "User updated successfully by admin", data: updatedUser });
    } catch (err) {
      next(err);
    }
  }

  static async deleteUserAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const foundUser = await prisma.user.findFirst({ where: { id: Number(id) } });
      if (!foundUser) throw { name: "DataNotFound" };

      await prisma.user.delete({ where: { id: Number(id) } });

      res.status(200).json({ message: `User  with ID ${id} deleted successfully by admin` });
    } catch (err) {
      next(err);
    }
  }
}
