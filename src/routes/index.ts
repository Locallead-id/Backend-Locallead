import { Router } from "express";
import multer from "multer";

import { errorHandler } from "../middlewares/errorHandler";
import { IndexController } from "../controllers";
import { router as userRouter } from "./user";
import { ResultController } from "../controllers/result";

export const router = Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

router.get("/", IndexController.home);
router.get("/test", ResultController.createResult);
router.use("/users", userRouter);
router.use(errorHandler);
