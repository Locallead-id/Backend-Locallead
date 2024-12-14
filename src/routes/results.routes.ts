import { Router } from "express";

import { ResultController } from "../controllers/result.controller";

export const router = Router();

router.get("/:resultId", ResultController.getUserResultById);
