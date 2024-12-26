import { Router } from "express";

import { AssessmentController } from "../controllers/assessment.controller";
import { ResultController } from "../controllers/result.controller";

export const router = Router();

router.get("/", AssessmentController.getAllAssessments);
router.get("/enrollments", AssessmentController.getAllEnrollments);
router.get("/results", ResultController.getUserAllResults);
router.get("/:assessmentId/start", AssessmentController.startAssessment);
router.post("/:assessmentId/submit", AssessmentController.submitAssessment);
router.get("/:assessmentId/result", ResultController.getUserResultById);
router.get("/:assessmentId", AssessmentController.getAssessmentById);
