import mongoose from "mongoose";
import announcementSchema from "../schemas/announcementSchema";
const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
