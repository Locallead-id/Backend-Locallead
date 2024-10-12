import { NextFunction, Response, Request } from "express";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let status = 500;
  let message = "Internal server error";

  switch (err.name as string) {
    case "EmailRequired":
      status = 400;
      message = "Please input your email!";
      break;
    case "PasswordRequired":
      status = 400;
      message = "Please input your password!";
      break;
    case "Unauthorized":
      status = 401;
      message = "Invalid email or password.";
      break;
    case "JsonWebTokenError":
    case "Unauthenticated":
      status = 401;
      message = "Invalid access token.";
      break;
    case "Forbidden":
      status = 403;
      message = "Insufficient privileges to do this action.";
      break;
    case "NotFound":
      status = 404;
      message = "Data not found!";
      break;
  }
  console.log(err);
  res.status(status).json(message);
};
