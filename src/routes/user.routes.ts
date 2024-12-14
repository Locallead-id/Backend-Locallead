import { Router } from "express";

import { UserController } from "../controllers/user.controller";

export const router = Router();

router.get("/profile", UserController.getLoggedUserDetail);
router.put("/profile", UserController.updateLoggedUserDetail);
router.get("/profile/payments", UserController.getLoggedUserPaymentHistories);
