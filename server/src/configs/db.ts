import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import config from "./config";
import { initializeSocket } from "../socket/socketManager";

const connectToDB = (app: any) => {
  if (!config.DB_URL) {
    throw new Error("DB_URL must be configured before the server starts");
  }

  mongoose
    .connect(config.DB_URL)
    .then(() => {
        console.log("🚀 mongodb connected successfully!");

        // Create HTTP server and Socket.IO
        const server = createServer(app);
        const allowedOrigins = new Set([
          config.CLIENT_URL,
          ...(config.NODE_ENV === "production"
            ? []
            : ["http://localhost:5173", "http://localhost:5174"]),
        ].filter((origin): origin is string => Boolean(origin)));

        const io = new Server(server, {
          cors: {
            origin: [...allowedOrigins],
            credentials: true,
          },
        });

        // Initialize Socket.IO handlers
        initializeSocket(io);

        server.listen(config.PORT, () => {
          console.log(`🚀 server running on port: ${config.PORT}`);
          console.log(`🔌 socket.io enabled on port: ${config.PORT}`);
        });
      })
      .catch((err) => {
        console.error("❌ db connection failed: ", err.message);
        process.exit(1);
      });
};

export default connectToDB;
