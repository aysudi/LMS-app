import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { AuthRequest } from "../types/common.types.js";

const router = Router();

router.get("/", authenticateToken, (req, res) =>
  getWishlist(req as AuthRequest, res)
);

router.post("/:courseId", authenticateToken, (req, res) =>
  addToWishlist(req as AuthRequest, res)
);

router.delete("/:courseId", authenticateToken, (req, res) =>
  removeFromWishlist(req as AuthRequest, res)
);

export default router;
