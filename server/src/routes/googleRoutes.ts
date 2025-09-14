import express from "express";
import passport from "passport";
import config from "../configs/config";
import { JWTUtils } from "../utils/jwt.utils";
import { IUser } from "../types/user.types";

const googleRouter = express.Router();

googleRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    session: false,
  })
);

googleRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${config.CLIENT_URL}/auth/login?error=google_failed`,
    session: false,
  }),
  (req: any, res) => {
    try {
      const user = req.user as IUser;

      if (!user) {
        return res.redirect(`${config.CLIENT_URL}/auth/error`);
      }

      const accessToken = JWTUtils.generateAccessToken(user);
      const refreshToken = JWTUtils.generateRefreshToken(user);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.redirect(`${config.CLIENT_URL}/auth/success/${accessToken}`);
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(`${config.CLIENT_URL}/auth/error`);
    }
  }
);

export default googleRouter;
