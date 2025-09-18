import { Request, Response } from "express";
import {
  getSearchSuggestions as getSearchSuggestionsService,
  saveSearchHistory as saveSearchHistoryService,
  getSearchHistory as getSearchHistoryService,
  clearSearchHistory as clearSearchHistoryService,
  getPopularSearches as getPopularSearchesService,
} from "../services/searchService.js";
import { SearchQuery, SearchHistoryQuery } from "../types/search.types.js";

export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q, limit, includeCategories, includeInstructors, includeCourses } =
      req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const query: SearchQuery = {
      q: q.trim(),
      limit: limit ? parseInt(limit as string) : 8,
      includeCategories: includeCategories !== "false",
      includeInstructors: includeInstructors !== "false",
      includeCourses: includeCourses !== "false",
    };

    const suggestions = await getSearchSuggestionsService(query);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Get search suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get search suggestions",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const saveSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
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
  } catch (error) {
    console.error("Save search history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save search history",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const getSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { limit, type } = req.query;

    const query: SearchHistoryQuery = {
      limit: limit ? parseInt(limit as string) : 10,
      type: type as "search" | "suggestion" | undefined,
    };

    const history = await getSearchHistoryService(userId, query);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get search history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get search history",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const clearSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
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
  } catch (error) {
    console.error("Clear search history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear search history",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const getPopularSearches = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const searchLimit = limit ? parseInt(limit as string) : 10;

    const popularSearches = await getPopularSearchesService(searchLimit);

    res.status(200).json({
      success: true,
      data: popularSearches,
    });
  } catch (error) {
    console.error("Get popular searches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get popular searches",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
