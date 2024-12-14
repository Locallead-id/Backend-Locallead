import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";
import { hashPassword } from "../helpers/bcrypt";

export class AdminController {
  // static async template(req: AuthRequest, res: Response, next: NextFunction) {
  //   try {
  //   } catch (err) {
  //     next(err);
  //   }
  // }
  static async createUserAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, name, jobTitle } = req.body;
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
              jobTitle,
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
      const { email, password, name, jobTitle, address, dateOfBirth, imageUrl, jobDepartment, jobBranch } = req.body;

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
                jobTitle,
                address,
                dateOfBirth,
                imageUrl,
                jobDepartment,
                jobBranch,
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
      const { id: userId } = req.params;
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
}
