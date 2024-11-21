import { Request, Response, NextFunction } from "express";

export class IndexController {
  static async home(_: Request, res: Response, __: NextFunction) {
    res.status(200).json({ message: "Locallead server is running..." });
  }
}
