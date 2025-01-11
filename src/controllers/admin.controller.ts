import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";
import { hashPassword } from "../helpers/bcrypt";
import { uploadImageFile } from "../services/firebase.service";
import { emailValidator } from "../helpers/emailValidator";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY as string;

export class AdminController {
  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let users = await prisma.user.findMany({ include: { profile: true, results: true }, where: { role: "USER" } });
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

  static async createAdminAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName, adminSecretKey } = req.body;
      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };
      if (adminSecretKey !== ADMIN_SECRET_KEY) throw { name: "WrongSecretKey" };
      if (!emailValidator(email)) throw { name: "InvalidEmail" };

      const admin = await prisma.user.findFirst({ where: { email } });
      if (admin) throw { name: "BadRequestExists" };

      const createdAdmin = await prisma.user.create({
        data: {
          email,
          password: hashPassword(password),
          role: "ADMIN",
          profile: {
            create: {
              fullName,
            },
          },
        },
      });
      res.status(201).json({ message: "Admin account created successfully", data: createdAdmin });
    } catch (err) {
      next(err);
    }
  }

  static async createUserAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName } = req.body;
      if (!email) throw { name: "EmailRequired" };
      if (!password) throw { name: "PasswordRequired" };
      if (!emailValidator(email)) throw { name: "InvalidEmail" };

      const user = await prisma.user.findFirst({ where: { email } });
      if (user) throw { name: "BadRequestExists" };

      const createdUser = await prisma.user.create({
        data: {
          email,
          password: hashPassword(password),
          role: "USER",
          profile: {
            create: {
              fullName,
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
      const { email, password, name, address, dateOfBirth, enrollments } = req.body;
      if (!emailValidator(email)) throw { name: "InvalidEmail" };

      const foundUser = await prisma.user.findFirst({ where: { id: Number(userId) } });
      if (!foundUser) throw { name: "DataNotFound" };

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          data: {
            email,
            ...(password && { password: hashPassword(password) }),
            profile: {
              update: {
                fullName: name,
                address,
                dateOfBirth: new Date(dateOfBirth),
              },
            },
          },
          where: { id: Number(userId) },
          include: {
            profile: true,
            enrollments: {
              include: {
                assessment: true,
              },
            },
          },
          omit: { password: true },
        });

        // If enrollments are provided, handle them
        if (enrollments) {
          // Delete existing enrollments
          await tx.enrollment.deleteMany({
            where: { userId: Number(userId) },
          });

          // Create new enrollments if array is not empty
          if (enrollments.length > 0) {
            // Create a dummy payment record for admin-created enrollments
            const payment = await tx.payment.create({
              data: {
                userId: Number(userId),
                amount: 0,
                status: "COMPLETED",
                transactionId: `ADMIN-${Date.now()}-${userId}`,
                transactionToken: "ADMIN",
                paymentMethod: "ADMIN",
                expireAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
              },
            });

            // Create new enrollments
            await tx.enrollment.createMany({
              data: enrollments.map((assessmentId: number) => ({
                userId: Number(userId),
                assessmentId: Number(assessmentId),
                paymentId: payment.id,
                status: "ACTIVE",
              })),
            });
          }
        }

        return await tx.user.findUnique({
          where: { id: Number(userId) },
          include: {
            profile: true,
            enrollments: {
              include: {
                assessment: true,
              },
            },
          },
        });
      });

      res.status(200).json({
        message: "User updated successfully by admin",
        data: updatedUser,
      });
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
      const image = req.file;
      if (!name || !description || !duration || !price) throw { message: "InputRequired" };
      if (!userId) throw { name: "Unauthenticated" };

      const assessment = await prisma.assessment.findFirst({ where: { name } });

      if (assessment) throw { name: "BadRequestExists" };
      if (Number(price) < 100) throw { name: "CurrencyMinimumValue" };

      let createdAssessment = await prisma.assessment.create({
        data: {
          name,
          description,
          duration: Number(duration),
          price: Number(price),
          userId,
        },
      });

      if (image) {
        const imageUrl = await uploadImageFile(image, name, createdAssessment.id, "assessment");
        createdAssessment = await prisma.assessment.update({ where: { id: createdAssessment.id }, data: { imageUrl } });
      }

      res.status(201).json({ message: "Assessment created successfully", data: createdAssessment });
    } catch (err) {
      next(err);
    }
  }

  static async updateAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.params;
      const { name, description, duration, price, isActive } = req.body;
      const image = req.file;

      const foundAssessment = await prisma.assessment.findFirst({ where: { id: Number(assessmentId) } });
      if (!foundAssessment) throw { name: "DataNotFound" };
      if (Number(price) < 100) throw { name: "CurrencyMinimumValue" };

      const updatedAssessment = await prisma.assessment.update({
        where: { id: Number(assessmentId) },
        data: {
          name,
          description,
          duration: Number(duration),
          price: Number(price),
          isActive,
        },
      });

      if (image) {
        const imageUrl = await uploadImageFile(image, name, Number(assessmentId), "assessment");
        await prisma.assessment.update({ where: { id: Number(assessmentId) }, data: { imageUrl } });
      }

      res.status(200).json({ message: "Assessment updated successfully by admin", data: updatedAssessment });
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

      await prisma.question.deleteMany({ where: { assessmentId: Number(assessmentId) } });
      const updatedQuestions = questions.map((q: { id: number; order: number; assessmentId: number; text: string; options: {}; createdAt: Date; updatedAt: Date; type: "SCALE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" }) => ({
        ...q,
        assessmentId: Number(assessmentId),
        type: "SCALE",
      }));
      await prisma.question.createMany({ data: updatedQuestions, skipDuplicates: true });

      const filledAssessment = await prisma.assessment.findFirst({ where: { id: Number(assessmentId) }, include: { questions: { orderBy: { order: "asc" } } } });

      res.status(200).json({ message: "Successfully filled assessment with questions", data: filledAssessment });
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
      const totalAssessment = await prisma.assessment.count({ where: { isActive: true } });
      const enrollments = await prisma.enrollment.findMany({ where: { userId: Number(userId) } });

      res.status(200).json({ message: "User results retrieved successfully", data: results, enrollments: enrollments, total_enrollments: enrollments.length, total_assessment: totalAssessment });
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
      const { status } = req.query;
      const where = status ? { isActive: status === "active" } : {};
      const assessments = await prisma.assessment.findMany({ where, include: { questions: { orderBy: { order: "asc" } } } });
      res.status(200).json({ message: "Assessments data retrieved successfully", data: assessments, total_assessments: assessments.length });
    } catch (err) {
      next(err);
    }
  }

  static async getPotentialFrauds(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const suspiciousPurchases = await prisma.purchaseLog.groupBy({
        by: ["ipAddress", "assessmentId"],
        having: {
          userId: {
            _count: {
              gt: 3,
            },
          },
        },
        _count: {
          userId: true,
        },
        _min: {
          createdAt: true,
        },
        _max: {
          createdAt: true,
        },
      });

      const fraudDetails = await Promise.all(
        suspiciousPurchases.map(async (purchase) => {
          const users = await prisma.purchaseLog.findMany({
            where: {
              ipAddress: purchase.ipAddress,
              assessmentId: purchase.assessmentId,
            },
            select: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
              assessment: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
              ipAddress: true,
              createdAt: true,
            },
          });

          return {
            ipAddress: purchase.ipAddress,
            assessmentId: purchase.assessmentId,
            assessmentName: users[0].assessment.name,
            assessmentPrice: users[0].assessment.price,
            totalPurchases: purchase._count.userId,
            earliestPurchase: purchase._min.createdAt,
            latestPurchase: purchase._max.createdAt,
            users: users.map((user) => ({
              userId: user.user.id,
              email: user.user.email,
              fullName: user.user.profile?.fullName,
              purchasedAt: user.createdAt,
            })),
          };
        })
      );

      res.status(200).json({
        message: "Potential frauds data retrieved successfully",
        data: fraudDetails,
      });
    } catch (err) {
      next(err);
    }
  }
}
