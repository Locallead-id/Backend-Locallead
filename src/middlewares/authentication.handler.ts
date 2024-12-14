import { Response, NextFunction } from "express";

import { decodeToken } from "../helpers/jwt";
import prisma from "../database/prisma";
import { AuthRequest } from "../types/types";

export const authentication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      throw { name: "Unauthenticated" };
    }
    const [type, token] = auth.split(" ");
    if (!type || type !== "Bearer") {
      throw { name: "Unauthenticated" };
    }

    if (!token) {
      throw { name: "Unauthenticated" };
    }

    const payload = decodeToken(token) as { id: String; iat: number };
    const foundUser = await prisma.user.findUnique({
      where: {
        id: Number(payload.id),
      },
    });

    if (!foundUser) {
      throw { name: "Unauthenticated" };
    }
    req.user = { id: foundUser.id, role: foundUser.role };
    next();
  } catch (err) {
    next(err);
  }
};
