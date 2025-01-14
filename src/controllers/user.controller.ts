import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";
import { uploadImageFile } from "../services/firebase.service";

export class UserController {
  static async getLoggedUserDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) throw { name: "Unauthenticated" };

      const { id } = req.user;

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: { profile: true },
        omit: { password: true },
      });

      if (!user) throw { name: "DataNotFound" };

      res.status(200).json({ message: "User data retrieved successfully", data: user });
    } catch (err) {
      next(err);
    }
  }

  static async updateLoggedUserDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) throw { name: "Unauthenticated" };

      const { id } = req.user;

      const foundUser = await prisma.user.findUnique({ where: { id: Number(id) } });

      if (!foundUser) throw { name: "DataNotFound" };

      const { address, dateOfBirth, imageUrl } = req.body;
      const image = req.file;

      const formattedDate = new Date(dateOfBirth);

      let updatedUserProfile = await prisma.profile.update({
        where: { id: Number(id) },
        data: { address, dateOfBirth: formattedDate, imageUrl },
      });
      if (image) {
        const imageUrl = await uploadImageFile(image, updatedUserProfile.fullName.split(" ").join("_"), updatedUserProfile.id, "profile");
        updatedUserProfile = await prisma.profile.update({ where: { id: updatedUserProfile.id }, data: { imageUrl } });
      }

      res.status(200).json({ message: "User Data updated successfully", data: updatedUserProfile });
    } catch (err) {
      next(err);
    }
  }

  static async getLoggedUserPaymentHistories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) throw { name: "Unauthenticated" };

      const { id } = req.user;

      const foundUser = await prisma.user.findUnique({ where: { id: Number(id) } });

      if (!foundUser) throw { name: "DataNotFound" };

      const payments = await prisma.payment.findMany({ where: { userId: Number(id) } });

      res.status(200).json({ message: "Payment history retrieved successfully", data: payments });
    } catch (err) {
      next(err);
    }
  }
}
