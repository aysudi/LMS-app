import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  confirmPayment,
} from "../controllers/orderController";
import { authenticateToken } from "../middlewares/auth.middleware";

import { AuthRequest } from "../types/common.types";

const orderRouter = Router();

orderRouter.get("/", authenticateToken, (req, res) =>
  getUserOrders(req as AuthRequest, res)
);

orderRouter.post("/", authenticateToken, (req, res) =>
  createOrder(req as AuthRequest, res)
);

orderRouter.get("/:orderId", authenticateToken, (req, res) =>
  getOrderById(req as AuthRequest, res)
);

orderRouter.patch("/:orderId/cancel", authenticateToken, (req, res) =>
  cancelOrder(req as AuthRequest, res)
);

orderRouter.post("/:orderId/confirm-payment", authenticateToken, (req, res) =>
  confirmPayment(req as AuthRequest, res)
);

export default orderRouter;
