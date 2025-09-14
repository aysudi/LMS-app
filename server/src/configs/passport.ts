import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "./config.js";
import { Profile } from "passport-google-oauth20";
import { VerifyCallback } from "passport-oauth2";
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from "passport-github2";
import UserModel from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID!,
      clientSecret: config.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${config.SERVER_URL}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        if (!profile.id || !profile.emails?.length) {
          return done(new Error("Invalid Google profile"), false);
        }

        const existingUser = await UserModel.findOne({
          providerId: profile.id,
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        const emailTaken = await UserModel.findOne({
          email: profile.emails?.[0].value,
        });

        if (emailTaken) {
          return done(null, false, {
            message: "Email is already used",
          });
        }

        const displayName = profile.displayName || "";
        const nameParts = displayName.trim().split(" ");
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || "Google";

        const newUser = await UserModel.create({
          firstName,
          lastName,
          username: `${profile.emails?.[0]?.value.split("@")[0]}-${Date.now()}`,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
          authProvider: "google",
          providerId: profile.id,
          isEmailVerified: true,
          lastLoginAt: new Date(),
        });

        return done(null, newUser);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID!,
      clientSecret: config.GITHUB_CLIENT_SECRET!,
      callbackURL: `${config.SERVER_URL}/auth/github/callback`,
      scope: ["user:email"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: GitHubProfile,
      done: VerifyCallback
    ) => {
      try {
        if (!profile.id) {
          return done(new Error("Invalid GitHub profile"), false);
        }

        const existingUser = await UserModel.findOne({
          providerId: profile.id,
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        const email =
          profile.emails?.find((e) => (e as { verified?: boolean }).verified)
            ?.value || profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found in GitHub profile"), false);
        }

        const emailTaken = await UserModel.findOne({ email });

        if (emailTaken) {
          return done(null, false, {
            message: "Email is already used",
          });
        }

        // Split display name into first and last name
        const displayName = profile.displayName || profile.username || "";
        const nameParts = displayName.trim().split(" ");
        const firstName = nameParts[0] || profile.username || "User";
        const lastName = nameParts.slice(1).join(" ") || "GitHub";

        const newUser = await UserModel.create({
          firstName,
          lastName,
          username: `${profile.username}-${Date.now()}`,
          email,
          avatar: profile.photos?.[0]?.value,
          authProvider: "github",
          providerId: profile.id,
          isEmailVerified: true,
          lastLoginAt: new Date(),
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
