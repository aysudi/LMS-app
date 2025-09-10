import mongoose from "mongoose";
export class DatabaseConfig {
    static async connect() {
        try {
            const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/skillify";
            await mongoose.connect(mongoUri);
            console.log("✅ Connected to MongoDB successfully");
            // Handle connection events
            mongoose.connection.on("error", (error) => {
                console.error("❌ MongoDB connection error:", error);
            });
            mongoose.connection.on("disconnected", () => {
                console.log("⚠️ MongoDB disconnected");
            });
            // Graceful shutdown
            process.on("SIGINT", async () => {
                try {
                    await mongoose.connection.close();
                    console.log("📝 MongoDB connection closed due to app termination");
                    process.exit(0);
                }
                catch (error) {
                    console.error("Error during MongoDB shutdown:", error);
                    process.exit(1);
                }
            });
        }
        catch (error) {
            console.error("❌ Failed to connect to MongoDB:", error);
            process.exit(1);
        }
    }
    static async disconnect() {
        try {
            await mongoose.connection.close();
            console.log("📝 MongoDB connection closed");
        }
        catch (error) {
            console.error("Error closing MongoDB connection:", error);
        }
    }
}
