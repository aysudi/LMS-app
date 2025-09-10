import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/common.types.js";

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error);

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const validationErrors: Record<string, string> = {};
    Object.keys(error.errors).forEach((key) => {
      validationErrors[key] = error.errors[key].message;
    });

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationErrors,
    } as ApiResponse);
    return;
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    res.status(409).json({
      success: false,
      message: `${field} already exists`,
      error: "DUPLICATE_ENTRY",
    } as ApiResponse);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
      error: "INVALID_ID",
    } as ApiResponse);
    return;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "INVALID_TOKEN",
    } as ApiResponse);
    return;
  }

  if (error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
      error: "TOKEN_EXPIRED",
    } as ApiResponse);
    return;
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: "INTERNAL_SERVER_ERROR",
  } as ApiResponse);
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: "NOT_FOUND",
  } as ApiResponse);
};
