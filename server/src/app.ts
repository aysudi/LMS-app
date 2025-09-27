import cors from "cors";
import passport from "passport";
import "./configs/passport.js";
import express from "express";
import cookieParser from "cookie-parser";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import userRouter from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import sectionRouter from "./routes/sectionRoute.js";
import lessonRouter from "./routes/lessonRoute.js";
import googleRouter from "./routes/googleRoutes.js";
import githubRouter from "./routes/githubRoutes.js";
import personalizationRouter from "./routes/personalization.js";
import searchRouter from "./routes/searchRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

const app = express();

app.use(passport.initialize());

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Health check route
app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Skillify API is up and running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/auth", googleRouter);
app.use("/auth", githubRouter);
app.use("/api/auth", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/sections", sectionRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/personalization", personalizationRouter);
app.use("/api/search", searchRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
