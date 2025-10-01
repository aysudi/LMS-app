import { Schema } from "mongoose";
const CartItemSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
    priceAtTimeOfAdding: {
        type: Number,
        required: true,
        min: 0,
    },
});
const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    items: [CartItemSchema],
}, {
    timestamps: true,
    versionKey: false,
});
CartSchema.index({ "items.courseId": 1 });
CartSchema.virtual("totalValue").get(function () {
    return this.items.reduce((total, item) => total + item.priceAtTimeOfAdding, 0);
});
CartSchema.virtual("itemsCount").get(function () {
    return this.items.length;
});
CartSchema.set("toJSON", { virtuals: true });
CartSchema.set("toObject", { virtuals: true });
export default CartSchema;
