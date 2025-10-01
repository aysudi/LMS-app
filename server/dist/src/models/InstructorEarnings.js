import mongoose from "mongoose";
import instructorEarningsSchema from "../schemas/instructorEarningsSchema.js";
const InstructorEarnings = mongoose.model("InstructorEarnings", instructorEarningsSchema);
export default InstructorEarnings;
