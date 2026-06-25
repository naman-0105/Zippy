import { Request, Response } from "express";
import axios from "axios";
import { razorpay } from "../config/razorpay.js";
import {
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
} from "../config/verifyRazorpay.js";
import { publishPaymentSuccess } from "../config/payment.producer.js";
import PaymentEvent from "../models/PaymentEvent.js";

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    const { data } = await axios.get(
      `${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(data.amount * 100),
      currency: "INR",
      receipt: orderId,
      notes: {
        orderId,
      },
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create Razorpay order",
    });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    await publishPaymentSuccess({
      orderId,
      paymentId: razorpay_payment_id,
      provider: "razorpay",
    });

    res.json({
      message: "Payment verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment verification error",
    });
  }
};

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).json({
        message: "Missing webhook signature or secret",
      });
    }

    // 1. Verify webhook signature BEFORE processing or recording anything
    const isValid = verifyRazorpayWebhookSignature(
      req.body,
      signature,
      webhookSecret
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid webhook signature",
      });
    }

    // 2. Extract stable Razorpay event identifier
    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;
    const orderEntity = req.body.payload?.order?.entity;

    const eventId =
      (req.headers["x-razorpay-event-id"] as string) ||
      req.body.event_id ||
      req.body.id ||
      `${event}:${paymentEntity?.id || orderEntity?.id || Date.now()}`;

    // 3. Check if already processed (Idempotency check)
    const existingEvent = await PaymentEvent.findOne({ eventId });
    if (existingEvent) {
      return res.status(200).json({
        message: "Webhook already processed",
      });
    }

    // 4. Atomically record PaymentEvent (protects against concurrent race conditions via unique index)
    try {
      await PaymentEvent.create({
        eventId,
        eventType: event || "unknown",
        provider: "razorpay",
        processedAt: new Date(),
      });
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(200).json({
          message: "Webhook already processed",
        });
      }
      throw err;
    }

    // 5. Process event business logic (guaranteed to execute only once per event)
    switch (event) {
      case "payment.captured":
      case "order.paid": {
        const orderId =
          paymentEntity?.notes?.orderId ||
          paymentEntity?.receipt ||
          orderEntity?.notes?.orderId ||
          orderEntity?.receipt;

        const paymentId = paymentEntity?.id || orderEntity?.id;

        if (orderId && paymentId) {
          await publishPaymentSuccess({
            orderId,
            paymentId,
            provider: "razorpay",
          });
        }
        break;
      }

      case "payment.failed": {
        // Payment failed: order remains unpaid/pending for retry
        break;
      }

      default:
        // Unsupported or unhandled event ignored safely
        break;
    }

    res.status(200).json({
      message: "Webhook processed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Webhook processing error",
    });
  }
};
