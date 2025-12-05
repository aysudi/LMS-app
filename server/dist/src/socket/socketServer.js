import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
const connectedUsers = new Map();
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY || "secret");
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
    }
    catch (error) {
        next(new Error("Authentication error"));
    }
};
let io = null;
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || [
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
            ],
            credentials: true,
        },
    });
    io.use(authenticateSocket);
    io.on("connection", (socket) => {
        const authSocket = socket;
        connectedUsers.set(authSocket.user.id, authSocket);
        // Join user to their personal room
        authSocket.join(`user:${authSocket.user.id}`);
        // Handle conversation joining
        authSocket.on("join:conversations", async (conversationIds) => {
            try {
                conversationIds.forEach((conversationId) => {
                    authSocket.join(`conversation:${conversationId}`);
                });
            }
            catch (error) {
                console.error("Error joining conversations:", error);
            }
        });
        // Handle course room joining
        authSocket.on("join:course", async (courseId) => {
            try {
                const enrollment = await Enrollment.findOne({
                    user: authSocket.user.id,
                    course: courseId,
                });
                console.log("enrollment: ", enrollment);
                if (enrollment) {
                    authSocket.join(`course-${courseId}`);
                    console.log(`✅ User ${authSocket.user.id} joined course room: course-${courseId}`);
                    // Log current room members
                    const room = io.sockets.adapter.rooms.get(`course-${courseId}`);
                    console.log(`👥 Total clients in room course-${courseId}:`, room ? room.size : 0);
                }
                else {
                    console.log(`❌ User ${authSocket.user.id} not enrolled in course: ${courseId}`);
                }
            }
            catch (error) {
                console.error("Error joining course room:", error);
            }
        });
        // Handle leaving course room
        authSocket.on("leave:course", (courseId) => {
            try {
                authSocket.leave(`course-${courseId}`);
                console.log(`User ${authSocket.user.id} left course room: ${courseId}`);
            }
            catch (error) {
                console.error("Error leaving course room:", error);
            }
        });
        // Register message handlers
        // registerMessageHandlers(io, authSocket);
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
export const getIO = () => io;
export { io };
