import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";

export const authorization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const foundUser = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });
    if (!foundUser) {
      throw { name: "NotFound" };
    }
    if (foundUser.role !== "ADMIN") {
      throw { name: "Forbidden" };
    }
    next();
  } catch (err) {
    next(err);
  }
};
