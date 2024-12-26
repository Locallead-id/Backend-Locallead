import { Router } from "express";

import { UserController } from "../controllers/user.controller";
import multer from "multer";

export const router = Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

router.get("/profile", UserController.getLoggedUserDetail);
router.put("/profile", upload.single("image"), UserController.updateLoggedUserDetail);
router.get("/profile/payments", UserController.getLoggedUserPaymentHistories);
