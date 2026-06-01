import mongoose from "mongoose";
import { ICart } from "../types/cart.type.js";
import CartSchema from "../schemas/cartSchema.js";

const Cart = mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
