import { Router } from "express";

import { errorHandler } from "../middlewares/errorHandler";
import { IndexController } from "../controllers";
import { router as userRouter } from "./user";

export const router = Router();

router.get("/", IndexController.home);
router.use("/users", userRouter);
router.use(errorHandler);
