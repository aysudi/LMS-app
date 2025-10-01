import mongoose from "mongoose";
import instructorCommunicationSchema from "../schemas/instructorCommunicationSchema";

const InstructorCommunication = mongoose.model(
  "InstructorCommunication",
  instructorCommunicationSchema
);

export default InstructorCommunication;
