import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";

export const authorization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) throw { name: "Unauthenticated" };

    if (!req.user.id) throw { name: "Unauthenticated" };

    const foundUser = await prisma.user.findUnique({
      where: {
        id: Number(req.user.id),
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
