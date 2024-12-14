import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";

export const authorization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) throw { name: "Unauthenticated" };

    const foundUser = await prisma.user.findFirst({
      where: {
        id: Number(req.user.id),
      },
    });

    if (!foundUser) throw { name: "Unauthenticated" };
    if (foundUser.role !== "ADMIN" || req.user.role !== "ADMIN") throw { name: "Forbidden" };

    next();
  } catch (err) {
    next(err);
  }
};
