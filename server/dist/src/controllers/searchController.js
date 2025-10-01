import { getSearchSuggestions as getSearchSuggestionsService, saveSearchHistory as saveSearchHistoryService, getSearchHistory as getSearchHistoryService, clearSearchHistory as clearSearchHistoryService, getPopularSearches as getPopularSearchesService, } from "../services/searchService.js";
export const getSearchSuggestions = async (req, res) => {
    try {
        const { q, limit, includeCategories, includeInstructors, includeCourses } = req.query;
        if (!q || typeof q !== "string") {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }
        const query = {
            q: q.trim(),
            limit: limit ? parseInt(limit) : 8,
            includeCategories: includeCategories !== "false",
            includeInstructors: includeInstructors !== "false",
            includeCourses: includeCourses !== "false",
        };
        const suggestions = await getSearchSuggestionsService(query);
        res.status(200).json({
            success: true,
            data: suggestions,
        });
    }
    catch (error) {
        console.error("Get search suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get search suggestions",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
export const saveSearchHistory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { query, type = "search", metadata } = req.body;
        if (!query || typeof query !== "string") {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }
        await saveSearchHistoryService(userId, {
            query: query.trim(),
            type,
            timestamp: new Date(),
            metadata,
        });
        res.status(201).json({
            success: true,
            message: "Search saved to history",
        });
    }
    catch (error) {
        console.error("Save search history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save search history",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
export const getSearchHistory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { limit, type } = req.query;
        const query = {
            limit: limit ? parseInt(limit) : 10,
            type: type,
        };
        const history = await getSearchHistoryService(userId, query);
        res.status(200).json({
            success: true,
            data: history,
        });
    }
    catch (error) {
        console.error("Get search history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get search history",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
export const clearSearchHistory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        await clearSearchHistoryService(userId);
        res.status(200).json({
            success: true,
            message: "Search history cleared",
        });
    }
    catch (error) {
        console.error("Clear search history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to clear search history",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
export const getPopularSearches = async (req, res) => {
    try {
        const { limit } = req.query;
        const searchLimit = limit ? parseInt(limit) : 10;
        const popularSearches = await getPopularSearchesService(searchLimit);
        res.status(200).json({
            success: true,
            data: popularSearches,
        });
    }
    catch (error) {
        console.error("Get popular searches error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get popular searches",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
