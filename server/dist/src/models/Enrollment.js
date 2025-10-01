import mongoose from "mongoose";
import enrollmentSchema from "../schemas/enrollmentSchema";
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
