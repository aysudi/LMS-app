import jwt from "jsonwebtoken";
import { IUser } from "../types/user.types.js";
import config from "../configs/config.js";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class JWTUtils {
  private static readonly ACCESS_TOKEN_SECRET =
    config.JWT_ACCESS_SECRET_KEY || "lms-access-secret";
  private static readonly REFRESH_TOKEN_SECRET =
    config.JWT_REFRESH_SECRET_KEY || "lms-refresh-secret";
  private static readonly ACCESS_TOKEN_EXPIRES_IN =
    config.JWT_ACCESS_EXPIRES_IN || "1h";
  private static readonly REFRESH_TOKEN_EXPIRES_IN =
    config.JWT_REFRESH_EXPIRES_IN || "7d";

  static generateAccessToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const options: any = {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN as string,
      issuer: "skillify",
      audience: "skillify-users",
    };

    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, options);
  }

  static generateRefreshToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const options: any = {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN as string,
      issuer: "skillify",
      audience: "skillify-users",
    };

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, options);
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
      issuer: "skillify",
      audience: "skillify-users",
    }) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
      issuer: "skillify",
      audience: "skillify-users",
    }) as JWTPayload;
  }

  static generateTokens(user: IUser): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }
}
