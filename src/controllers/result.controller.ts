import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";
export class ResultController {
  static async getUserAllResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) throw { name: "Unauthenticated" };

      const userId = req.user.id;

      const results = await prisma.result.findMany({
        where: { userId },
      });

      const totalAssessment = await prisma.assessment.count();

      res.status(200).json({ messaage: "Results data successfully retrieved", data: results, total_assessment: totalAssessment });
    } catch (err) {
      next(err);
    }
  }

  static async getUserResultById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) throw { name: "Unauthenticated" };
      const userId = req.user.id;
      const { assessmentId } = req.params;

      const result = await prisma.result.findFirst({
        where: {
          assessmentId: Number(assessmentId),
          userId,
        },
      });
      if (!result) throw { name: "DataNotFound" };

      res.status(200).json({ message: "Result data successfully retrieved", data: result });
    } catch (err) {
      next(err);
    }
  }
}
