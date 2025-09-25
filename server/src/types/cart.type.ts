import mongoose from "mongoose";

export interface ICartItem {
  courseId: mongoose.Types.ObjectId;
  addedAt: Date;
  priceAtTimeOfAdding: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}
