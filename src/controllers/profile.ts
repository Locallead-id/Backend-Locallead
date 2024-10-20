import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";

export class ProfileController {
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { address, dateOfBirth } = req.body;
      const { user } = req;
      const updatedProfile = await prisma.profile.update({
        where: {
          id: user?.id,
        },
        data: { address, dateOfBirth },
      });

      // implement firebase image for image storing
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
