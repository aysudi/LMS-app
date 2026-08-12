import cors from "cors";
import passport from "passport";
import "./configs/passport";
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import userRouter from "./routes/userRoutes";
import courseRouter from "./routes/courseRoutes";
import sectionRouter from "./routes/sectionRoute";
import lessonRouter from "./routes/lessonRoute";
import googleRouter from "./routes/googleRoutes";
import githubRouter from "./routes/githubRoutes";
import personalizationRouter from "./routes/personalization";
import searchRouter from "./routes/searchRoutes";
import wishlistRouter from "./routes/wishlistRoutes";
import cartRouter from "./routes/cartRoutes";
import orderRouter from "./routes/orderRoutes";
import stripeRouter from "./routes/stripeRoute";
import enrollmentRouter from "./routes/enrollmentRoutes";
import userProgressRouter from "./routes/userProgressRoutes";
import instructorRouter from "./routes/instructorRoutes";
import instructorApplicationRouter from "./routes/instructorApplicationRoutes";
import adminRouter from "./routes/adminRoutes";
import qaRouter from "./routes/qaRoutes";
import certificateRouter from "./routes/certificateRoutes";
import announcementRouter from "./routes/announcementRoutes";
import contactRouter from "./routes/contactRoutes";
import courseMessageRouter from "./routes/courseMessageRoutes";
import studentInstructorMessageRouter from "./routes/studentInstructorMessageRoutes";
import config from "./configs/config";

const app = express();

app.use(passport.initialize());

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: [config.CLIENT_URL || "http://localhost:5173"],
    credentials: true,
  }),
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
app.use("/api/payments", stripeRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/user-progress", userProgressRouter);
app.use("/api/instructor", instructorRouter);
app.use("/api/instructor-applications", instructorApplicationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/qa", qaRouter);
app.use("/api/certificates", certificateRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/contact", contactRouter);
app.use("/api/course-messages", courseMessageRouter);
app.use("/api/student-instructor-messages", studentInstructorMessageRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
