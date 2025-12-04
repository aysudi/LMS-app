import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JWTUtils } from "../utils/jwt.utils.js";
import Enrollment from "../models/Enrollment.js";

interface SocketUser {
  userId: string;
  socketId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthenticatedSocket extends Socket {
  userId: string;
  userEmail: string;
  userRole: string;
  userFirstName: string;
  userLastName: string;
}

// Store connected users
const connectedUsers = new Map<string, SocketUser>();
const userSockets = new Map<string, string>(); // userId -> socketId

// Store IO instance
let ioInstance: Server | null = null;

export const initializeSocket = (io: Server) => {
  ioInstance = io;
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization ||
        socket.handshake.query.token;

      if (!token) {
        console.error("❌ No authentication token provided");
        return next(new Error("Authentication token required"));
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace("Bearer ", "");

      const decoded = JWTUtils.verifyAccessToken(cleanToken);

      if (!decoded || !decoded.userId) {
        console.error("❌ Invalid token structure:", decoded);
        return next(new Error("Invalid token"));
      }

      const authSocket = socket as AuthenticatedSocket;
      authSocket.userId = decoded.userId;
      authSocket.userEmail = decoded.email;
      authSocket.userRole = decoded.role;
      authSocket.userFirstName = ""; // Not available in JWT
      authSocket.userLastName = ""; // Not available in JWT

      next();
    } catch (error) {
      console.error("❌ Socket authentication error:", error);
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("❌ JWT Error details:", error.message);
        if (error.message.includes("invalid signature")) {
          console.error(
            "❌ Token signature verification failed - check JWT secret"
          );
        } else if (error.message.includes("jwt expired")) {
          console.error("❌ Token has expired");
        } else if (error.message.includes("jwt malformed")) {
          console.error("❌ Token is malformed");
        }
      }
      next(
        new Error(
          `Authentication failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
    }
  });

  io.on("connection", (socket) => {
    const authSocket = socket as AuthenticatedSocket;

    // Store user connection
    const user: SocketUser = {
      userId: authSocket.userId,
      socketId: authSocket.id,
      email: authSocket.userEmail,
      firstName: "", // We don't have these in JWT payload
      lastName: "",
    };

    connectedUsers.set(authSocket.id, user);
    userSockets.set(authSocket.userId, authSocket.id);

    // Notify others that user is online
    authSocket.broadcast.emit("user:online", {
      userId: authSocket.userId,
      username: authSocket.userEmail,
    });

    // Initialize message handlers

    // Handle joining conversation rooms
    authSocket.on("conversation:join", (conversationId: string) => {
      authSocket.join(`conversation:${conversationId}`);
    });

    authSocket.on("conversation:leave", (conversationId: string) => {
      authSocket.leave(`conversation:${conversationId}`);
    });

    // Handle bulk conversation joining
    authSocket.on("conversations:join", (conversationIds: string[]) => {
      conversationIds.forEach((id) => {
        authSocket.join(`conversation:${id}`);
      });
    });

    // Handle course room joining
    authSocket.on("join:course", async (courseId: string) => {
      try {
        const allEnrollments = await Enrollment.find({
          user: authSocket.userId,
          course: courseId,
        });

        const enrollment = await Enrollment.findOne({
          user: authSocket.userId,
          course: courseId,
          status: { $in: ["active", "completed"] },
        });

        if (enrollment) {
          authSocket.join(`course-${courseId}`);

          // Log current room members
          const room = io.sockets.adapter.rooms.get(`course-${courseId}`);
        } else {
          console.log(
            `❌ User ${authSocket.userId} not enrolled in course: ${courseId}`
          );
        }
      } catch (error) {
        console.error("Error joining course room:", error);
      }
    });

    // Handle leaving course room
    authSocket.on("leave:course", (courseId: string) => {
      try {
        authSocket.leave(`course-${courseId}`);
      } catch (error) {
        console.error("Error leaving course room:", error);
      }
    });

    // Handle disconnect
    authSocket.on("disconnect", (reason) => {
      connectedUsers.delete(authSocket.id);
      userSockets.delete(authSocket.userId);

      authSocket.broadcast.emit("user:offline", {
        userId: authSocket.userId,
        username: authSocket.userEmail,
      });
    });

    // Handle connection errors
    authSocket.on("error", (error) => {
      console.error(`🚨 Socket error for user ${authSocket.userId}:`, error);
    });
  });

  // Global error handler
  io.engine.on("connection_error", (err) => {
    console.error("Socket.IO connection error:", err);
  });
};

export const getConnectedUsers = () => Array.from(connectedUsers.values());
export const getUserSocketId = (userId: string) => userSockets.get(userId);
export const isUserOnline = (userId: string) => userSockets.has(userId);

export const getIO = () => ioInstance;
