import { Router } from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  getCartSummary,
  checkInCart,
  getCartCount,
} from "../controllers/cartController";
import { authenticateToken } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types/common.types";

const cartRouter = Router();

// Get user's cart
cartRouter.get("/", authenticateToken, (req, res) =>
  getCart(req as AuthRequest, res)
);

// Get cart summary (for header)
cartRouter.get("/summary", authenticateToken, (req, res) =>
  getCartSummary(req as AuthRequest, res)
);

// Get cart count
cartRouter.get("/count", authenticateToken, (req, res) =>
  getCartCount(req as AuthRequest, res)
);

// Check if course is in cart
cartRouter.get("/check/:courseId", authenticateToken, (req, res) =>
  checkInCart(req as AuthRequest, res)
);

// Clear entire cart (must come before /:courseId route)
cartRouter.delete("/clear", authenticateToken, (req, res) =>
  clearCart(req as AuthRequest, res)
);

// Add course to cart
cartRouter.post("/:courseId", authenticateToken, (req, res) =>
  addToCart(req as AuthRequest, res)
);

// Remove course from cart
cartRouter.delete("/:courseId", authenticateToken, (req, res) =>
  removeFromCart(req as AuthRequest, res)
);

export default cartRouter;
