import jwt from "jsonwebtoken";
import { JWTUtils } from "../utils/jwt.utils.js";
import { messageHandlers } from "./messageHandlers.js";
// Store connected users
const connectedUsers = new Map();
const userSockets = new Map(); // userId -> socketId
export const initializeSocket = (io) => {
    // Middleware for authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token ||
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
            const authSocket = socket;
            authSocket.userId = decoded.userId;
            authSocket.userEmail = decoded.email;
            authSocket.userRole = decoded.role;
            authSocket.userFirstName = ""; // Not available in JWT
            authSocket.userLastName = ""; // Not available in JWT
            next();
        }
        catch (error) {
            console.error("❌ Socket authentication error:", error);
            if (error instanceof jwt.JsonWebTokenError) {
                console.error("❌ JWT Error details:", error.message);
                if (error.message.includes("invalid signature")) {
                    console.error("❌ Token signature verification failed - check JWT secret");
                }
                else if (error.message.includes("jwt expired")) {
                    console.error("❌ Token has expired");
                }
                else if (error.message.includes("jwt malformed")) {
                    console.error("❌ Token is malformed");
                }
            }
            next(new Error(`Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`));
        }
    });
    io.on("connection", (socket) => {
        const authSocket = socket;
        // Store user connection
        const user = {
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
        messageHandlers(authSocket, io, connectedUsers, userSockets);
        // Handle joining conversation rooms
        authSocket.on("conversation:join", (conversationId) => {
            authSocket.join(`conversation:${conversationId}`);
        });
        authSocket.on("conversation:leave", (conversationId) => {
            authSocket.leave(`conversation:${conversationId}`);
        });
        // Handle bulk conversation joining
        authSocket.on("conversations:join", (conversationIds) => {
            conversationIds.forEach((id) => {
                authSocket.join(`conversation:${id}`);
            });
        });
        // Handle disconnect
        authSocket.on("disconnect", (reason) => {
            // Remove user from connected users
            connectedUsers.delete(authSocket.id);
            userSockets.delete(authSocket.userId);
            // Notify others that user is offline
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
// Helper functions to get user info
export const getConnectedUsers = () => Array.from(connectedUsers.values());
export const getUserSocketId = (userId) => userSockets.get(userId);
export const isUserOnline = (userId) => userSockets.has(userId);
