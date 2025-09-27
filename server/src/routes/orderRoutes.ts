import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/orderController";
import { authenticateToken } from "../middlewares/auth.middleware";

import { AuthRequest } from "../types/common.types";

const orderRouter = Router();

// GET /api/orders - Get user's orders
orderRouter.get("/", authenticateToken, (req, res) =>
  getUserOrders(req as AuthRequest, res)
);

// POST /api/orders - Create new order
orderRouter.post("/", authenticateToken, (req, res) =>
  createOrder(req as AuthRequest, res)
);

// GET /api/orders/:orderId - Get specific order details
orderRouter.get("/:orderId", authenticateToken, (req, res) =>
  getOrderById(req as AuthRequest, res)
);

// PATCH /api/orders/:orderId/cancel - Cancel an order
orderRouter.patch("/:orderId/cancel", authenticateToken, (req, res) =>
  cancelOrder(req as AuthRequest, res)
);

export default orderRouter;
