import { Request, Response, NextFunction } from "express";
import { JWTUtils } from "../utils/jwt.utils.js";
import { ApiResponse } from "../types/common.types.js";
import { UserRole } from "../types/user.types.js";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
        error: "UNAUTHORIZED",
      } as ApiResponse);
      return;
    }

    const decoded = JWTUtils.verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "Access token has expired",
          error: "TOKEN_EXPIRED",
        } as ApiResponse);
        return;
      }

      if (error.name === "JsonWebTokenError") {
        res.status(401).json({
          success: false,
          message: "Invalid access token",
          error: "INVALID_TOKEN",
        } as ApiResponse);
        return;
      }
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: "UNAUTHORIZED",
    } as ApiResponse);
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      } as ApiResponse);
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        error: "FORBIDDEN",
      } as ApiResponse);
      return;
    }

    next();
  };
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = JWTUtils.verifyAccessToken(token);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
      } catch (error) {
        // Token is invalid but we don't throw error for optional auth
        // User will be undefined
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors
    next();
  }
};
