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
      const { assessmentId } = req.params;

      if (!assessmentId) throw { name: "DataNotFound" };

      const assessment = await prisma.assessment.findUnique({ where: { id: Number(assessmentId) }, include: { questions: true } });

      if (!assessment) throw { name: "DataNotFound" };

      res.status(200).json({ message: "Assessment module data successfully retrieved", data: assessment });
    } catch (err) {
      next(err);
    }
  }

  static async startAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.params;
      if (!assessmentId) throw { name: "DataNotFound" };

      const userId = req.user?.id;
      if (!userId) throw { name: "Unauthenticated" };

      const assessment = await prisma.assessment.findFirst({
        where: { id: Number(assessmentId), isActive: true },
        include: {
          questions: { select: { id: true, text: true, type: true, options: true, order: true }, orderBy: { order: "asc" } },
        },
      });

      if (!assessment) throw { name: "DataNotFound" };

      // ** Assessment in progress validation **
      const existingResult = await prisma.result.findFirst({ where: { userId, assessmentId: Number(assessmentId), status: "IN_PROGRESS" } });

      if (existingResult) {
        res.status(200).json({ message: "Existing assessment in progress", data: existingResult });
        return;
      }

      const newResult = await prisma.result.create({
        data: {
          userId: userId,
          assessmentId: Number(assessmentId),
          status: "IN_PROGRESS",
          startedAt: new Date(),
          answers: [],
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
      const { assessmentId } = req.params;
      const { answers } = req.body;
      const userId = req.user?.id;

      if (!userId) throw { name: "Unauthenticated" };
      if (!assessmentId) throw { name: "DataNotFound" };
      if (!answers) throw { name: "InputRequired" };

      const existingResult = await prisma.result.findFirst({
        where: {
          assessmentId: Number(assessmentId),
          userId: userId,
        },
      });

      if (!existingResult) throw { name: "AssessmentNotStarted" };
      if (existingResult?.status === "COMPLETED") throw { name: "AlreadyTaken" };

      const results = await prisma.result.findMany({});
      const respondents = results.map((result) => ({ id: result.userId, responses: result.answers }));
      respondents.push({ id: userId, responses: answers });

      const processedResult = await axios(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, data: { respondents } });

      if (!processedResult) throw { name: "InternalServerError" };

      const updatedResult = await prisma.result.update({
        where: { assessmentId: Number(assessmentId), userId, id: existingResult.id },
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
