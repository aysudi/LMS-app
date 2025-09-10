import mongoose from "mongoose";
import config from "./config";
const connectToDB = (app) => {
    if (config.DB_URL) {
        mongoose
            .connect(config.DB_URL)
            .then(() => {
            console.log("🚀 mongodb connected successfully!");
            app.listen(config.PORT, () => {
                console.log(`server running on port: ${config.PORT}`);
            });
        })
            .catch((err) => {
            console.warn("❌ db connection failed: ", err.message);
        });
    }
};
export default connectToDB;
