import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET as string;

export const signToken = (payload: { id: string; role: "ADMIN" | "USER" }): string => {
  return jwt.sign(payload, SECRET);
};

export const decodeToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
