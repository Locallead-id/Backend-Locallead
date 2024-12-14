import { Router } from "express";

import { AssessmentController } from "../controllers/assessment.controller";

export const router = Router();

router.get("/", AssessmentController.getAllAssessments);
router.get("/:assessmentId", AssessmentController.getAssessmentById);
router.post("/:assessmentId/start", AssessmentController.startAssessment);
router.delete("/:assessmentId/submit", AssessmentController.submitAssessment);
