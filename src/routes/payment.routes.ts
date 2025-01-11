import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authentication } from "../middlewares/authentication.handler";

export const router = Router();

router.post("/create", authentication, PaymentController.payMidtrans);
router.post("/notification", PaymentController.notificationHandler);
