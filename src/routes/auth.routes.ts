import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { authentication } from "../middlewares/authentication.handler";

export const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/verify/", authentication, AuthController.resendVerificationEmail);
router.get("/verify/:token", AuthController.verifyAccount)