import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import { AuthenticatedSocket } from "../types/socket.type.js";
import { registerMessageHandlers } from "../utils/messageHandlers.js";

const connectedUsers = new Map<string, AuthenticatedSocket>();

const authenticateSocket = async (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth.token;
    console.log("token: ", token);
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET_KEY || "secret"
    ) as any;
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket: any) => {
    const authSocket = socket as AuthenticatedSocket;

    connectedUsers.set(authSocket.user.id, authSocket);

    // Join user to their personal room
    authSocket.join(`user:${authSocket.user.id}`);

    // Handle conversation joining
    authSocket.on("join:conversations", async (conversationIds: string[]) => {
      try {
        conversationIds.forEach((conversationId) => {
          authSocket.join(`conversation:${conversationId}`);
        });
      } catch (error) {
        console.error("Error joining conversations:", error);
      }
    });

    // Register message handlers
    registerMessageHandlers(io, authSocket);

    // Handle user online status
    authSocket.on("status:online", () => {
      authSocket.broadcast.emit("user:online", {
        userId: authSocket.user.id,
        username: authSocket.user.username,
      });
    });

    // Handle disconnect
    authSocket.on("disconnect", () => {
      connectedUsers.delete(authSocket.user.id);

      authSocket.broadcast.emit("user:offline", {
        userId: authSocket.user.id,
        username: authSocket.user.username,
      });
    });
  });

  return io;
};
