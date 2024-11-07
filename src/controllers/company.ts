import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";
import { uploadImageFile } from "../services/firebase.service";

export class Company {
  static async getCompanies(_: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companies = await prisma.company.findMany();

      res.status(200).json({ message: "successfully retrieved all companies", data: companies });
    } catch (err) {
      next(err);
    }
  }

  static async getCompanyById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw { name: "NotFound" };
      const company = await prisma.company.findUnique({ where: { id: Number(id) } });

      res.status(200).json({ message: "successfully retrieved company data", data: company });
    } catch (err) {
      next(err);
    }
  }

  static async createCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      if (!name) throw { name: "FieldRequired", field: "company_name" };
      if (!req.file) throw { name: "FieldRequired", field: "company_profile_image" };

      const foundCompany = await prisma.company.findFirst({
        where: {
          name,
        },
      });

      if (foundCompany) throw { name: "UniqueDataExists" };

      const createdCompany = await prisma.company.create({ data: { name } });

      const imageUrl = await uploadImageFile(req.file as Express.Multer.File, name, createdCompany.id, "Companies");
      const updatedCompany = await prisma.company.update({ where: { id: createdCompany.id }, data: { imageUrl, updatedAt: new Date(Date.now()) } });

      res.status(201).json({ message: "successfully created new company", data: updatedCompany });
    } catch (err) {
      next(err);
    }
  }

  static async updateCompanyById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!id) throw { name: "NotFound" };

      let imageUrl;
      if (req.file) {
        imageUrl = await uploadImageFile(req.file as Express.Multer.File, name, Number(id), "Companies");
      }

      await prisma.company.update({
        where: { id: Number(id) },
        data: {
          name,
          imageUrl,
          updatedAt: new Date(Date.now()),
        },
      });

      res.status(200).json({ message: "successfully updated company data" });
    } catch (err) {
      next(err);
    }
  }

  static async deleteCompanyById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw { name: "NotFound" };

      await prisma.company.delete({ where: { id: Number(id) } });

      res.status(200).json({ message: "successfully deleted company data" });
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
