import { Router } from "express";
import { errorHandler } from "../middlewares/errorHandler";
import { IndexController } from "../controllers";

export const router = Router();

router.get("/", IndexController.home);

router.use(errorHandler);
