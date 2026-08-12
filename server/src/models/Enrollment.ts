import mongoose from "mongoose";
import enrollmentSchema from "../schemas/enrollmentSchema";
import type { IEnrollment } from "../types/enrollment.types";

const Enrollment = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
