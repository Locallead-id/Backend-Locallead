import { Router } from "express";

import { ResultController } from "../controllers/result.controller";

export const router = Router();

router.get("/:id", ResultController.getUserResultById);
// router.get("/:id/download", ResultController.downloadUserResultById);
