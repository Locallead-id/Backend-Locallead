import { Router } from "express";

import { errorHandler } from "../middlewares/error.handler";
import { authentication } from "../middlewares/authentication.handler";
import { IndexController } from "../controllers/index.controller";
import { router as userRouter } from "./user.routes";
import { router as authRouter } from "./auth.routes";
import { router as assessmentRouter } from "./assessment.routes";
import { router as adminRouter } from "./admin.routes";
import { router as paymentRouter } from "./payment.routes";

export const router = Router();

router.get("/", IndexController.home);
router.use("/auth", authRouter);
router.use("/users", authentication, userRouter);
router.use("/assessments", authentication, assessmentRouter);
router.use("/admin", authentication, adminRouter);
router.use("/payments", paymentRouter);
router.use(errorHandler);
