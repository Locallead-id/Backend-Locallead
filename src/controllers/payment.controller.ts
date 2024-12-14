import { Response, NextFunction } from "express";
import midtransClient from "midtrans-client";
import { PaymentStatus } from "@prisma/client";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";

export class PaymentController {
  static async payAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      let snap = new midtransClient.Snap({
        isProduction: process.env.NODE_ENV === "production",
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
      });

      const amount = 50000;
      const uniqueOrderId = `${new Date().getTime()}-${userId}`;
      const user = await prisma.user.findFirst({ where: { id: userId }, include: { profile: true } });

      if (user?.profile?.isPremium) throw { name: "AlreadyPremium" };

      let parameter = {
        transaction_details: {
          order_id: uniqueOrderId,
          gross_amount: 50000,
        },
        credit_card: { secure: true },
        customer_details: {
          email: user?.email,
          first_name: user?.profile?.fullName || "User",
        },
        enabled_payments: ["bca_va", "bni_va", "mandiri_va", "gopay", "shopeepay"],
        // callbacks: {
        //   finish: `${process.env.FRONTEND_URL}/payment/finish`,
        //   error: `${process.env.FRONTEND_URL}/payment/error`,
        // },
      };

      const transaction = await snap.createTransaction(parameter);

      await prisma.payment.create({
        data: {
          userId: Number(userId),
          amount,
          status: "PENDING",
          paymentMethod: "MIDTRANS",
          transactionId: uniqueOrderId,
          transactionToken: transaction.token,
          expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      res.status(200).json({ token: transaction.token, redirect_url: transaction.redirect_url, order_id: uniqueOrderId });
    } catch (err) {
      next(err);
    }
  }

  static async notificationHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const snap = new midtransClient.Snap({
        isProduction: process.env.NODE_ENV === "production",
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
      });

      const { order_id, transaction_status, fraud_status } = await snap.transaction.notification(req.body);

      if (!order_id || !transaction_status) throw { name: "BadRequest" };

      const statusMap: Record<string, PaymentStatus> = {
        capture: fraud_status === "accept" ? "COMPLETED" : "FAILED",
        settlement: "COMPLETED",
        cancel: "FAILED",
        deny: "FAILED",
        expire: "FAILED",
        failure: "FAILED",
        pending: "PENDING",
      };

      const newStatus = statusMap[transaction_status as keyof typeof statusMap];

      if (newStatus === null) throw { name: "FraudDetected" };
      if (!newStatus) throw { name: "UnexpectedStatus" };

      await prisma.payment.update({
        where: { transactionId: order_id },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      res.status(200).json({ status: "ok" });
    } catch (err) {
      next(err);
    }
  }
}
