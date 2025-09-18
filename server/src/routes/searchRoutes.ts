import express from "express";
import {
  getSearchSuggestions,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  getPopularSearches,
} from "../controllers/searchController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
/**
 * @route GET /api/search/suggestions
 * @desc Get search suggestions
 * @access Public
 * @query q - search query (required)
 * @query limit - number of suggestions (optional, default: 8)
 * @query includeCategories - include category suggestions (optional, default: true)
 * @query includeInstructors - include instructor suggestions (optional, default: true)
 * @query includeCourses - include course suggestions (optional, default: true)
 */
router.get("/suggestions", getSearchSuggestions);

/**
 * @route GET /api/search/popular
 * @desc Get popular search terms
 * @access Public
 * @query limit - number of popular searches (optional, default: 10)
 */
router.get("/popular", getPopularSearches);

// Protected routes (require authentication)
/**
 * @route POST /api/search/history
 * @desc Save search to user's history
 * @access Private
 * @body query - search query (required)
 * @body type - search type: 'search' or 'suggestion' (optional, default: 'search')
 * @body metadata - additional metadata (optional)
 */
router.post("/history", authenticateToken, saveSearchHistory);

/**
 * @route GET /api/search/history
 * @desc Get user's search history
 * @access Private
 * @query limit - number of history items (optional, default: 10)
 * @query type - filter by search type (optional)
 */
router.get("/history", authenticateToken, getSearchHistory);

/**
 * @route DELETE /api/search/history
 * @desc Clear user's search history
 * @access Private
 */
router.delete("/history", authenticateToken, clearSearchHistory);

export default router;
