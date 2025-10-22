import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import config from "./config.js";
import { initializeSocket } from "../socket/socketManager.js";

const connectToDB = (app: any) => {
  if (config.DB_URL) {
    mongoose
      .connect(config.DB_URL)
      .then(() => {
        console.log("🚀 mongodb connected successfully!");

        // Create HTTP server and Socket.IO
        const server = createServer(app);
        const io = new Server(server, {
          cors: {
            origin: ["http://localhost:5173", "http://localhost:5174"],
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
        console.warn("❌ db connection failed: ", err.message);
      });
  }
};

export default connectToDB;
