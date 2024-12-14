import { Router } from "express";

import { authorization } from "../middlewares/authorization";
import { AdminController } from "../controllers/admin.controller";
export const router = Router();

router.use(authorization);
router.post("/users", AdminController.createUserAccount);
router.put("/users/:userId", AdminController.updateUserAccount);
router.delete("/users/:userId", AdminController.deleteUserAccount);
router.post("/assessments", AdminController.createAssessment);
router.put("/assessments/:assessmentId", AdminController.addQuestionAssessment);
// router.post("/register");
// router.post("/login");
