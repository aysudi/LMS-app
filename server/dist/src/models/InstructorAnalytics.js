import mongoose from "mongoose";
import instructorAnalyticsSchema from "../schemas/instructorAnalyticsSchema.js";
const InstructorAnalytics = mongoose.model("InstructorAnalytics", instructorAnalyticsSchema);
export default InstructorAnalytics;
