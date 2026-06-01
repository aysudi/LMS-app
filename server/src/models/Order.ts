import mongoose from "mongoose";
import orderSchema from "../schemas/orderSchema.js";
import type { IOrder } from "../types/order.types.js";

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
