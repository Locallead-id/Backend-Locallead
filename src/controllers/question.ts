import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";

export class QuestionController {
  static async getQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw { name: "NotFound" };

      const findQuestions = await prisma.question.findMany({
        where: {
          id: Number(id),
        },
      });

      if (findQuestions.length == 0) throw { name: "NotFound" };

      res.status(200).json({ message: "successfully retrieved question data", data: findQuestions });
    } catch (err) {
      next(err);
    }
  }

  static async createQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw { name: "NotFound" };

      const { text, type, choices, correctAnswer } = req.body;

      if (!text || !type || !choices || !correctAnswer) throw { name: "FieldRequired", fields: ";text;type;choices;correctAnswer" };

      const createdQuestion = await prisma.question.create({
        data: {
          text,
          type,
          choices,
          correctAnswer,
          assessmentId: Number(id),
        },
      });

      res.status(201).json({ message: "successfully created question", data: createdQuestion });
    } catch (err) {
      next(err);
    }
  }

  static async updateQuestionById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, questionId } = req.params;
      if (!id || !questionId) throw { name: "NotFound" };

      const { text, type, choices, correctAnswer } = req.body;

      const findQuestion = await prisma.question.findUnique({ where: { id: Number(questionId) } });

      if (!findQuestion) throw { name: "NotFound" };

      const updatedQuestion = await prisma.question.update({
        where: { id: Number(questionId) },
        data: { text, type, choices, correctAnswer },
      });

      res.status(200).json({ message: "successfully updated question", data: updatedQuestion });
    } catch (err) {
      next(err);
    }
  }

  static async deleteQuestionById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, questionId } = req.params;
      if (!id || !questionId) throw { name: "NotFound" };

      const findQuestion = await prisma.question.findUnique({ where: { id: Number(questionId) } });

      if (!findQuestion) throw { name: "NotFound" };

      await prisma.question.delete({ where: { id: Number(questionId) } });

      res.status(200).json({ message: "successfully deleted question data", data: findQuestion });
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
