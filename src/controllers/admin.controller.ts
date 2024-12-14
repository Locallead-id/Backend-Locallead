import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";
import { hashPassword } from "../helpers/bcrypt";

export class AdminController {
  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let users = await prisma.user.findMany({ include: { profile: true, results: true } });
      const totalAssessment = await prisma.assessment.count();
      users = users.map((user) => {
        return { ...user, total_results: user.results.length, total_assessments: totalAssessment };
      });
      res.status(200).json({ message: "Users data retrieved successfully", data: users, total_users: users.length });
    } catch (err) {
      next(err);
    }
  }

  static async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const user = await prisma.user.findFirst({ where: { id: Number(userId) }, include: { profile: true } });

      if (!user || !userId) throw { name: "DataNotFound" };

      res.status(200).json({ message: "User data retrieved successfully", data: user });
    } catch (err) {
      next(err);
    }
  }

  static async createUserAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
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
      const { userId } = req.params;
      const { email, password, name, address, dateOfBirth, imageUrl } = req.body;

      const foundUser = await prisma.user.findFirst({ where: { id: Number(userId) } });
      if (!foundUser) throw { name: "DataNotFound" };

      const updatedUser = await prisma.user.update({
        data: {
          email,
          password: hashPassword(password),
          profile: {
            update: {
              data: {
                fullName: name,
                address,
                dateOfBirth,
                imageUrl,
              },
            },
          },
        },
        where: { id: Number(userId) },
      });

      res.status(200).json({ message: "User updated successfully by admin", data: updatedUser });
    } catch (err) {
      next(err);
    }
  }

  static async deleteUserAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const foundUser = await prisma.user.findFirst({ where: { id: Number(userId) } });
      if (!foundUser) throw { name: "DataNotFound" };

      await prisma.user.delete({ where: { id: Number(userId) } });

      res.status(200).json({ message: `User  with ID ${userId} deleted successfully by admin` });
    } catch (err) {
      next(err);
    }
  }

  //  **Assessment related**

  static async createAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { name, description, duration, price } = req.body;

      if (!name || !description || !duration || !price) throw { message: "InputRequired" };
      if (!userId) throw { name: "Unauthenticated" };

      const createdAssessment = await prisma.assessment.create({
        data: {
          name,
          description,
          duration,
          price,
          userId,
        },
      });

      res.status(201).json({ message: "Assessment created successfully", data: createdAssessment });
    } catch (err) {
      next(err);
    }
  }

  static async addQuestionAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { assessmentId } = req.params;
      const { questions } = req.body;

      if (questions.length === 0) throw { name: "InputRequired" };
      if (!assessmentId) throw { name: "DataNotFound" };
      if (!userId) throw { name: "Unauthenticated" };

      await prisma.question.createMany({ data: questions, skipDuplicates: true });
      const filledAssessment = await prisma.assessment.findFirst({ where: { id: Number(assessmentId) }, include: { questions: true } });

      res.status(201).json({ message: "Successfully filled assessment with questions", data: filledAssessment });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.params;

      const foundAssessment = await prisma.assessment.findFirst({ where: { id: Number(assessmentId) } });
      if (!foundAssessment || !assessmentId) throw { name: "DataNotFound" };

      await prisma.assessment.delete({ where: { id: Number(assessmentId) } });

      res.status(200).json({ message: `Assessment with ID ${assessmentId} deleted successfully by admin` });
    } catch (err) {
      next(err);
    }
  }

  static async getUserResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const results = await prisma.result.findMany({ where: { userId: Number(userId) } });
      const totalAssessment = await prisma.assessment.count();

      res.status(200).json({ message: "User results retrieved successfully", data: results, total_assessment: totalAssessment });
    } catch (err) {
      next(err);
    }
  }

  static async getUserResultById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, assessmentId } = req.params;

      const result = await prisma.result.findFirst({ where: { id: Number(assessmentId), userId: Number(userId) } });
      if (!result) throw { name: "DataNotFound" };

      res.status(200).json({ message: "Result data retrieved successfully", data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getAllAssessments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assessments = await prisma.assessment.findMany({ include: { questions: true } });
      res.status(200).json({ message: "Assessments data retrieved successfully", data: assessments, total_assessments: assessments.length });
    } catch (err) {
      next(err);
    }
  }
}
