import mongoose from "mongoose";
import sectionSchema from "../schemas/sectionSchema";
const Section = mongoose.model("Section", sectionSchema);
export default Section;
