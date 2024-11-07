import { Router } from "express";

import { Job as JobController } from "../controllers/job";
import { authorization } from "../middlewares/authorization";

export const router = Router();

router.get("/", JobController.getJobs);
router.get("/:id", JobController.getJobById);

router.use(authorization);

router.post("/", JobController.createJob);
router.patch("/:id", JobController.updateJobById);
router.delete("/:id", JobController.deleteJobById);
