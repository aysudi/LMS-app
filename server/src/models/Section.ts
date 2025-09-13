import mongoose, { Document } from "mongoose";
import sectionSchema from "../schemas/sectionSchema";
import { ISection } from "../types/section.types";

const Section = mongoose.model<ISection>("Section", sectionSchema);

export default Section;
