import mongoose from "mongoose";
import orderSchema from "../schemas/orderSchema";
import type { IOrder } from "../types/order.types";

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
