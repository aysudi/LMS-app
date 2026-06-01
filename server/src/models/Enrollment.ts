import mongoose from "mongoose";
import enrollmentSchema from "../schemas/enrollmentSchema.js";
import type { IEnrollment } from "../types/enrollment.types.js";

const Enrollment = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
