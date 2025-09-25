import mongoose from "mongoose";
import { ICart } from "../types/cart.type";
import CartSchema from "../schemas/cartSchema";

const Cart = mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
