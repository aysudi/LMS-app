import mongoose from "mongoose";
import orderSchema from "../schemas/orderSchema";
const Order = mongoose.model("Order", orderSchema);
export default Order;
