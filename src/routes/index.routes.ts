import { Router } from "express";
import multer from "multer";

import { errorHandler } from "../middlewares/errorHandler";
import { authorization } from "../middlewares/authorization";
import { authentication } from "../middlewares/authentication";
import { IndexController } from "../controllers/index.controller";
import { router as userRouter } from "./user.routes";
import { router as authRouter } from "./auth.routes";
import { router as assessmentRouter } from "./assessment.routes";
import { router as adminRouter } from "./admin.routes";
import { router as paymentRouter } from "./payment.routes";

export const router = Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

router.get("/", IndexController.home);
router.use("/auth", authRouter);
router.use("/users", authentication, userRouter);
router.use("/assessments", authentication, assessmentRouter);
router.use("/admin", authentication, authorization, adminRouter);
router.use("/payments", paymentRouter);
router.use(errorHandler);
