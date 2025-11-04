import mongoose from "mongoose";
import conversationSchema from "../schemas/conversationSchema";
const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
