import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler, } from "./middlewares/error.middleware.js";
import userRouter from "./routes/userRoutes.js";
const app = express();
// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));
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
app.use("/api/auth", userRouter);
// 404 handler
app.use(notFoundHandler);
// Global error handler
app.use(errorHandler);
export default app;
