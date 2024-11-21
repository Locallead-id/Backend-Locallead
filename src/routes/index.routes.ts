import { Router } from "express";
import multer from "multer";

import { errorHandler } from "../middlewares/errorHandler";
import { IndexController } from "../controllers/index.controller";
import { router as userRouter } from "./user.routes";
import { router as authRouter } from "./auth.routes";
import { authentication } from "../middlewares/authentication";
import { router as assessmentRouter } from "./assessment.routes";
export const router = Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

router.get("/", IndexController.home);
router.use("/auth", authRouter);
router.use("/users", authentication, userRouter);
router.use("/assessments", authentication, assessmentRouter);
router.use("/results", authentication, userRouter);
router.use(errorHandler);
