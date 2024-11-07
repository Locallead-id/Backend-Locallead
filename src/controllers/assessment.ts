import { NextFunction, Response } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";
import { uploadImageFile } from "../services/firebase.service";

export class Assessment {
  static async getAssessments(_: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assessments = await prisma.assessment.findMany();

      res.status(200).json({ message: "successfully retrieved assessments", data: assessments });
    } catch (err) {
      next(err);
    }
  }
  static async getAssessmentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const assessment = await prisma.assessment.findUnique({
        where: {
          id: Number(id),
        },
      });

      res.status(200).json({ message: "successfully retrieved assessment data", data: assessment });
    } catch (err) {
      next(err);
    }
  }
  static async createAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user?.id) {
        throw { name: "Unauthenticated" };
      }
      const { id } = req.user;
      const { name, description, duration } = req.body;
      if (!name || !description || !duration) throw { name: "FieldRequired", fields: ";name;description;duration" };

      const createdAssessment = await prisma.assessment.create({
        data: {
          name,
          description,
          duration,
          createdBy: { connect: { id: id } },
        },
      });

      let imageUrl;

      if (req.file) {
        imageUrl = await uploadImageFile(req.file as Express.Multer.File, name, createdAssessment.id, "assessment");
      }

      const updatedCreatedAssesment = await prisma.assessment.update({
        where: { id: createdAssessment.id },
        data: { imageUrl: imageUrl },
      });

      res.status(201).json({ message: "successfully created assessment", data: updatedCreatedAssesment });
    } catch (err) {
      next(err);
    }
  }
  static async updateAssessmentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user?.id) throw { name: "Unauthenticated" };

      const { id } = req.params;

      const findAssessment = await prisma.assessment.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!findAssessment) throw { name: "NotFound" };
      const { name, description, duration } = req.body;
      let imageUrl = findAssessment.imageUrl;
      if (req.file) {
        imageUrl = await uploadImageFile(req.file as Express.Multer.File, name, findAssessment.id, "assessment");
      }

      const updatedAssessment = await prisma.assessment.update({
        where: { id: Number(id) },
        data: {
          name,
          description,
          duration,
          imageUrl,
        },
      });

      res.status(200).json({ message: "successfully updated assessment", data: updatedAssessment });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAssessmentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user?.id) throw { name: "Unauthenticated" };

      const { id } = req.params;
      const findAssessment = await prisma.assessment.findUnique({ where: { id: Number(id) } });
      if (!findAssessment) throw { name: "NotFound" };

      await prisma.assessment.delete({ where: { id: findAssessment.id } });

      res.status(200).json({ message: "successfully deleted assessment", data: findAssessment });
    } catch (err) {
      next(err);
    }
  }
  /// static async template(req: AuthRequest, res: Response, next: NextFunction) {
  //   try {
  //   } catch (err) {
  //     next(err)
  //   }
  // }
}
