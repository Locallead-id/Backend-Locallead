import { Response, NextFunction } from "express";
import axios from "axios";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";

const API_URL = process.env.API_URL as string;

export class AssessmentController {
  static async getAllAssessments(_: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assessments = await prisma.assessment.findMany();

      res.status(200).json({ message: "Assessment modules data successfully retrieved", data: assessments });
    } catch (err) {
      next(err);
    }
  }

  static async getAssessmentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) throw { name: "DataNotFound" };

      const assessment = await prisma.assessment.findUnique({ where: { id: Number(id) }, include: { questions: true } });

      if (!assessment) throw { name: "DataNotFound" };

      res.status(200).json({ message: "Assessment module data successfully retrieved", data: assessment });
    } catch (err) {
      next(err);
    }
  }

  static async startAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw { name: "DataNotFound" };

      const userId = req.user?.id;
      if (!userId) throw { name: "Unauthenticated" };

      const assessment = await prisma.assessment.findFirst({
        where: { id: Number(id), isActive: true },
        include: {
          questions: { select: { id: true, text: true, type: true, options: true, order: true }, orderBy: { order: "asc" } },
        },
      });

      if (!assessment) throw { name: "DataNotFound" };

      // Recent submission validation

      const recentTimeValidation = new Date();
      recentTimeValidation.setDate(recentTimeValidation.getDate() - 30);

      const recentSubmission = await prisma.result.findFirst({
        where: { userId, assessmentId: Number(id), status: "COMPLETED", completedAt: { gte: recentTimeValidation } },
        orderBy: { completedAt: "desc" },
      });

      if (recentSubmission) {
        const daysSinceLastSubmission = Math.ceil(new Date().getTime() - recentSubmission.completedAt!.getTime()) / (1000 * 60 * 60 * 24);

        res.status(400).json({
          message: `You have recently completed this assessment Please wait ${30 - daysSinceLastSubmission} more days before retaking.`,
          data: { lastSubmissionDate: recentSubmission.completedAt, daysRemaining: 30 - daysSinceLastSubmission },
        });
        return;
      }

      // Assessment in progress validation

      const existingResult = await prisma.result.findFirst({ where: { userId, assessmentId: Number(id), status: "IN_PROGRESS" } });

      if (existingResult) {
        res.status(200).json({ message: "Existing assessment in progress", data: existingResult });
        return;
      }

      const newResult = await prisma.result.create({
        data: {
          userId: userId,
          assessmentId: Number(id),
          status: "IN_PROGRESS",
          startedAt: new Date(),
          answers: {},
          score: 0,
          timeDuration: 0,
        },
      });

      res.status(201).json({
        message: "Assessment started successfully",
        data: {
          resultId: newResult.id,
          assessment: {
            id: assessment.id,
            name: assessment.name,
            description: assessment.description,
            duration: assessment.duration,
            questions: assessment.questions.map((q) => ({ id: q.id, text: q.text, type: q.type, options: q.options })),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async submitAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { resultId } = req.params;
      const { answers } = req.body;
      const userId = req.user?.id;

      if (!userId) throw { name: "Unauthenticated" };
      if (!resultId) throw { name: "DataNotFound" };
      if (!answers) throw { name: "InvalidInput" };

      const existingResult = await prisma.result.findUnique({
        where: {
          id: Number(resultId),
          userId: userId,
          status: "IN_PROGRESS",
        },
        include: {
          assessment: {
            include: {
              questions: true,
            },
          },
        },
      });

      if (!existingResult) throw { name: "DataNotFound" };

      const processedResult = await axios(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, data: { respondents: answers } });

      if (!processedResult) throw { name: "InternalServerError" };

      const updatedResult = await prisma.result.update({
        where: { id: Number(resultId) },
        data: {
          answers,
          score: processedResult.data,
          completedAt: new Date(),
          status: "COMPLETED",
          timeDuration: Math.ceil((new Date().getTime() - existingResult.startedAt.getTime()) / 1000),
        },
      });

      res.status(200).json({ message: "Assessment submitted successfully", data: updatedResult });
    } catch (err) {
      next(err);
    }
  }
}
