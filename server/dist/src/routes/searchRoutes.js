import express from "express";
import { getSearchSuggestions, saveSearchHistory, getSearchHistory, clearSearchHistory, getPopularSearches, } from "../controllers/searchController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = express.Router();
// Public routes
router.get("/suggestions", getSearchSuggestions);
router.get("/popular", getPopularSearches);
// Protected routes (require authentication)
router.post("/history", authenticateToken, saveSearchHistory);
router.get("/history", authenticateToken, getSearchHistory);
router.delete("/history", authenticateToken, clearSearchHistory);
export default router;
