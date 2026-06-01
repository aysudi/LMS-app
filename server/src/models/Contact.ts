import mongoose from "mongoose";
import ContactSchema from "../schemas/contactSchema.js";

const Contact = mongoose.model("Contact", ContactSchema);

export default Contact;
