import { NextFunction, Response } from "express";

import { AuthRequest } from "../types/types";

export const errorHandler = (err: Error, _: AuthRequest, res: Response, __: NextFunction) => {
  let status = 500;
  let message = "Internal server error. Please try again later.";

  switch (err.name as string) {
    case "EmailRequired":
      status = 400;
      message = "Please input your email!";
      break;
    case "PasswordRequired":
      status = 400;
      message = "Please input your password!";
      break;
    case "InvalidInput":
      status = 400;
      message = "Some inputs are invalid or incorrect. Please make sure you fill all the input with the correct format";
      break;
    case "InputRequired":
      status = 400;
      message = "Some inputs are missing. Please make sure you have already fill all the required input.";
      break;
    case "BadRequest":
      status = 400;
      message = "Some inputs are missing. Please try again.";
      break;
    case "BadRequestExists":
      status = 400;
      message = "Item already exists. Please try fill it again.";
      break;
    case "AssessmentNotStarted":
      status = 400;
      message = "You can't submit the result because the assessment hasn't started yet. Please start the assessment first.";
      break;
    case "AlreadyTaken":
      status = 400;
      message = "You have already taken the assessment. You cannot retake the assessment.";
      break;
    case "AlreadyPremium":
      status = 400;
      message = "Account is already premium. You don't need to pay again.";
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
    case "FraudDetected":
      status = 403;
      message = "Fraud detected. Payments are not processed.";
      break;
    case "DataNotFound":
    case "NotFound":
    case "NotFoundError":
      status = 404;
      message = "Data not found!";
      break;
    case "UnexpectedStatus":
      status = 500;
      message = "Internal Server Error. Please try again later.";
      break;
  }
  console.log(err);
  res.status(status).json({ message: message });
};
