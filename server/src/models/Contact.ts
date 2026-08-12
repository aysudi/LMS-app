import mongoose from "mongoose";
import ContactSchema from "../schemas/contactSchema";

const Contact = mongoose.model("Contact", ContactSchema);

export default Contact;
