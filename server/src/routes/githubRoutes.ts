import express from "express";
import passport from "passport";
import config from "../configs/config";
import { JWTUtils } from "../utils/jwt.utils";
import { IUser } from "../types/user.types";

const githubRouter = express.Router();

githubRouter.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  })
);

githubRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
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
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${config.CLIENT_URL}/auth/success/${accessToken}`);
    } catch (error) {
      console.error("💥 GitHub callback error:", error);
      res.redirect(`${config.CLIENT_URL}/auth/error`);
    }
  }
);

export default githubRouter;
