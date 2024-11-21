import { Router } from "express";

import { AssessmentController } from "../controllers/assessment.controller";

export const router = Router();

router.get("/", AssessmentController.getAllAssessments);
router.get("/:id", AssessmentController.getAssessmentById);
router.post("/:id/start", AssessmentController.startAssessment);
router.delete("/:id/submit", AssessmentController.submitAssessment);
