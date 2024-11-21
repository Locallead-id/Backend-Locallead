import { Router } from "express";

import { UserController } from "../controllers/user.controller";

export const router = Router();

router.get("/profile", UserController.getLoggedUserDetail);
router.put("/profile", UserController.updateLoggedUserDetail);
router.get("/results", UserController.getLoggedUserAssessmentHistories);
router.get("/payments", UserController.getLoggedUserPaymentHistories);
