import mongoose from "mongoose";
import CartSchema from "../schemas/cartSchema";
const Cart = mongoose.model("Cart", CartSchema);
export default Cart;
