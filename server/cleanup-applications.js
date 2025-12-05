import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function cleanupApplications() {
  try {
    await mongoose.connect(
      process.env.DB_URL || "mongodb://localhost:27017/skillify"
    );
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    // Find all instructor applications
    const applications = await db
      .collection("instructorapplications")
      .find({})
      .toArray();
    console.log(`Found ${applications.length} instructor applications`);

    for (const app of applications) {
      console.log(
        `Application ${app._id}: Status=${app.status}, User=${app.user}`
      );
    }

    // Optional: Remove any duplicate applications for the same user (keeping the latest)
    const userApplications = {};
    for (const app of applications) {
      const userId = app.user.toString();
      if (!userApplications[userId]) {
        userApplications[userId] = [];
      }
      userApplications[userId].push(app);
    }

    for (const [userId, apps] of Object.entries(userApplications)) {
      if (apps.length > 1) {
        console.log(`User ${userId} has ${apps.length} applications`);
        // Sort by creation date and keep only the latest
        apps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        for (let i = 1; i < apps.length; i++) {
          console.log(
            `Removing duplicate application ${apps[i]._id} for user ${userId}`
          );
          await db
            .collection("instructorapplications")
            .deleteOne({ _id: apps[i]._id });
        }
      }
    }

    console.log("Cleanup completed");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

cleanupApplications();
