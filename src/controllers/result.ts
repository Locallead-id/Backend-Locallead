import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";
import axios from "axios";

const API_URL = process.env.API_URL as string;
export class ResultController {
  static async getResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) throw { name: "Unauthenticated" };

      const { id } = req.user;

      const findResults = await prisma.result.findMany({
        where: { userId: id },
      });

      res.status(200).json({ messaage: "successfully retrieved results", data: findResults });
    } catch (err) {
      next(err);
    }
  }

  static async getUserResultById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { resultId } = req.params;
      if (!resultId) throw { name: "NotFound" };

      const findResults = await prisma.assessment.findUnique({ where: { id: Number(resultId) } });
      if (!findResults) throw { name: "NotFound" };

      res.status(200).json({ message: "successfully retrieved result data", data: findResults });
    } catch (err) {
      next(err);
    }
  }

  static async createResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) throw { name: "Unauthenticated" };

      const { id } = req.user;
      const { assessmentId, answers, timeFinished } = req.body;

      const respondents = answers;

      const responses = await axios(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { respondents },
      });

      const createdResult = await prisma.result.create({
        data: {
          answers: answers,
          score: responses.data,
          timeFinished,
          assessmentId,
          userId: id,
        },
      });

      res.status(200).json({ message: "successfully created result", data: createdResult });
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
