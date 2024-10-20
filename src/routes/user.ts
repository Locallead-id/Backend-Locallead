import { Router } from "express";

import { UserController } from "../controllers/user";

export const router = Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
