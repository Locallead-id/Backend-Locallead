import { Router } from "express";

import { UserController } from "../controllers/user";
import { authorization } from "../middlewares/authorization";

export const router = Router();

router.get("", authorization, UserController.getAllUsers);
router.post("", authorization, UserController.createUser);

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/me", UserController.getOwnUserDetail);

router.get("/:id", authorization, UserController.getUserDetail);
router.put("/:id", authorization, UserController.updateUser);
router.delete("/:id", authorization, UserController.deleteUser);
