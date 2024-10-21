import { Response, NextFunction, Request } from "express";
import { compareHashedPassword } from "../helpers/bcrypt";
import { signToken } from "../helpers/jwt";
import prisma from "../database/prisma";
import { AuthRequest } from "../types/types";

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
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

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };

      const foundUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!foundUser) throw { name: "Unauthorized" };

      if (!compareHashedPassword(password, foundUser.password)) throw { name: "Unauthorized" };

      const access_token = signToken({ id: String(foundUser.id) });
      res.status(200).json({ access_token });
    } catch (err) {
      next(err);
    }
  }

  static async getOwnUserDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw { name: "DataNotFound" };
      const { id } = req.user;

      const user = await prisma.user.findUnique({ where: { id: id }, include: { profile: true }, omit: { password: true } });

      if (!user || !id) throw { name: "DataNotFound" };

      res.status(200).json({ message: "successfully retrieved user data", data: user });
    } catch (err) {
      next(err);
    }
  }

  static async getUserDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id: Number(id) }, include: { profile: true }, omit: { password: true } });

      if (!user || !id) throw { name: "DataNotFound" };

      res.status(200).json({ message: "successfully retrieved user data", data: user });
    } catch (err) {
      next(err);
    }
  }

  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let options: { skip?: number; take?: number; where?: object; include: {} } = { include: { profile: true } };
      const { pagination, filter } = req.query;

      if (pagination) {
        options.skip = 10 * (Number(pagination) - 1);
        options.take = 10;
      }
      if (filter) {
        options.where = { profile: { fullName: { contains: filter } } };
      }
      const users = await prisma.user.findMany(options);
      const totalPages = Math.floor((await prisma.user.count()) / 10);

      res.status(200).json({ message: "successfully retrieved users data", data: users, current_page: pagination, filter: filter, total_page: totalPages });
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req: AuthRequest, res: Response, next: NextFunction) {
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
  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const deletedUser = await prisma.user.delete({
        where: { id: Number(id) },
        select: {
          email: true,
          profile: true,
        },
      });

      if (!deletedUser || !id) throw { name: "DataNotFound" };

      res.status(200).json({ message: "successfully deleted user data", deleted_data: deletedUser });
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw { name: "DataNotFound" };

      const { email, password } = req.body;

      const updatedUser = await prisma.user.update({ where: { id: Number(id), email: email }, data: { email, password } });

      res.status(200).json({ message: "successfully updated user data" });
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
