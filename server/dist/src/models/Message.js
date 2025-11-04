import mongoose from "mongoose";
import messageSchema from "../schemas/messageSchema";
const Message = mongoose.model("Message", messageSchema);
export default Message;
