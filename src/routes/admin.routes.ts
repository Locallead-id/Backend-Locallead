import { Router } from "express";
import multer from "multer";

import { authorization } from "../middlewares/authorization.handler";
import { AdminController } from "../controllers/admin.controller";

export const router = Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

router.use(authorization);

// ** Users **
router.get("/users", AdminController.getAllUsers);
router.post("/users", AdminController.createUserAccount);
router.get("/users/:userId", AdminController.getUserById);
router.put("/users/:userId", AdminController.updateUserAccount);
router.delete("/users/:userId", AdminController.deleteUserAccount);
router.get("/users/:userId/assessments", AdminController.getUserResults);
router.get("/users/:userId/assessments/:assessmentId", AdminController.getUserResultById);

// ** Assessment **
router.get("/assessments", AdminController.getAllAssessments);
router.post("/assessments", upload.single("image"), AdminController.createAssessment);
router.put("/assessments/:assessmentId", AdminController.addQuestionAssessment);
router.delete("/assessments/:assessmentId", AdminController.deleteAssessment);
