import { Router } from "express";

import { authorization } from "../middlewares/authorization";
import { AdminController } from "../controllers/admin.controller";
export const router = Router();

router.use(authorization);
router.post("/users", AdminController.createUserAccount);
router.put("/users/:id", AdminController.updateUserAccount);
router.delete("/users/:id", AdminController.deleteUserAccount);

// router.post("/register");
// router.post("/login");
