import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";

export const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
// router.get("/verify", AuthController.verifyAccount)
