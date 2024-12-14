import { Router } from "express";

import { AssessmentController } from "../controllers/assessment.controller";
import { ResultController } from "../controllers/result.controller";

export const router = Router();

router.get("/", AssessmentController.getAllAssessments);
router.get("/results", ResultController.getUserAllResults);
router.get("/:assessmentId", AssessmentController.getAssessmentById);
router.get("/:assessmentId/start", AssessmentController.startAssessment);
router.post("/:assessmentId/submit", AssessmentController.submitAssessment);
router.get("/:assessmentId/result", ResultController.getUserResultById);
