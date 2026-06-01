import mongoose, { Document } from "mongoose";
import sectionSchema from "../schemas/sectionSchema.js";
import { ISection } from "../types/section.types.js";

const Section = mongoose.model<ISection>("Section", sectionSchema);

export default Section;
