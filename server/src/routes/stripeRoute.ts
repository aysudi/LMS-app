import express from "express";
import Stripe from "stripe";
import { authenticateToken } from "../middlewares/auth.middleware";
import Order from "../models/Order";
import config from "../configs/config";
import { OrderStatus } from "../types/order.types";
import type { AuthRequest } from "../types/common.types";

const stripeRouter = express.Router();

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe payments are not configured");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
};

stripeRouter.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const { orderId, successUrl, cancelUrl } = req.body;
    const userId = (req as AuthRequest).user?.id;
    const clientOrigin = config.CLIENT_URL
      ? new URL(config.CLIENT_URL).origin
      : undefined;

    if (
      !userId ||
      typeof orderId !== "string" ||
      typeof successUrl !== "string" ||
      typeof cancelUrl !== "string" ||
      !clientOrigin ||
      new URL(successUrl).origin !== clientOrigin ||
      new URL(cancelUrl).origin !== clientOrigin
    ) {
      return res.status(400).json({ message: "Invalid order or redirect URL" });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: OrderStatus.PENDING,
    }).populate("items.course", "title");

    if (!order || order.total <= 0) {
      return res.status(404).json({ message: "Pending payable order not found" });
    }

    const stripe = getStripe();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.items.map((item: any) => {
        const course = item.course;
        return {
          quantity: 1,
          price_data: {
            currency: order.currency.toLowerCase(),
            unit_amount: Math.round(item.actualPrice * 100),
            product_data: { name: course.title },
          },
        };
      });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: { orderId: order.id, userId },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Create checkout session failed:", err);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
});

stripeRouter.post("/create-payment-intent", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = (req as AuthRequest).user?.id;

    if (!userId || typeof orderId !== "string") {
      return res.status(400).json({ message: "A valid order is required" });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: OrderStatus.PENDING,
    });

    if (!order) {
      return res.status(404).json({ message: "Pending order not found" });
    }

    if (order.total <= 0) {
      return res.status(400).json({ message: "Order total must be positive" });
    }

    const stripe = getStripe();

    const pi = await stripe.paymentIntents.create(
      {
        amount: Math.round(order.total * 100),
        currency: order.currency.toLowerCase(),
        metadata: { orderId: order.id, userId },
        automatic_payment_methods: { enabled: true },
      },
      {
        idempotencyKey: `skillify-order-${order.id}`,
      },
    );

    return res.json({ clientSecret: pi.client_secret });
  } catch (err) {
    console.error("Create payment intent failed:", err);
    return res.status(500).json({ message: "Failed to create payment intent" });
  }
});

export default stripeRouter;
