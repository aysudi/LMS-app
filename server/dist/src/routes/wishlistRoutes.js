import { Router } from "express";
import { getWishlist, addToWishlist, removeFromWishlist, } from "../controllers/wishlistController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", authenticateToken, (req, res) => getWishlist(req, res));
router.post("/:courseId", authenticateToken, (req, res) => addToWishlist(req, res));
router.delete("/:courseId", authenticateToken, (req, res) => removeFromWishlist(req, res));
export default router;
