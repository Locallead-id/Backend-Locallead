import { Request, Response, NextFunction } from "express";
import { compareHashedPassword } from "../helpers/bcrypt";
import { signToken } from "../helpers/jwt";

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };

      // const createdUser = await
      res.status(201).json({ id: createdUser.id, email, name });
    } catch (err) {
      next(err);
    }
  }

  static async template(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };

      // Find One User Data

      if (!compareHashedPassword(password, user.password)) {
        throw { name: "Unauthorized" };
      }
      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token });
    } catch (err) {
      next(err);
    }
  }

  // static async template(req: Request, res: Response, next: NextFunction) {
  //   try {

  //   } catch (err) {
  //     next(err)
  //   }
  // }
}
