import { Request, Response, NextFunction } from "express";

export class IndexController {
  static async home(req: Request, res: Response) {
    res.status(200).json({ message: "Locallead server is running..." });
  }
}

