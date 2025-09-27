import mongoose from "mongoose";
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "../types/order.types";

const orderItemSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    actualPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false, versionKey: false }
);

const paymentDetailsSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    stripeChargeId: {
      type: String,
      sparse: true,
    },
    last4: {
      type: String,
      minlength: 4,
      maxlength: 4,
    },
    cardBrand: {
      type: String,
      enum: [
        "visa",
        "mastercard",
        "amex",
        "discover",
        "diners",
        "jcb",
        "unionpay",
        "unknown",
      ],
    },
    transactionId: {
      type: String,
      required: true,
    },
    receiptUrl: {
      type: String,
    },
    refundId: {
      type: String,
      sparse: true,
    },
  },
  { _id: false, versionKey: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentDetails: paymentDetailsSchema,
    billingAddress: {
      fullName: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
      country: { type: String, trim: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    notes: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    metadata: {
      ipAddress: { type: String },
      userAgent: { type: String },
      source: { type: String, default: "web" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
    console.log("Generated orderNumber:", this.orderNumber);
  }
  next();
});

orderSchema.virtual("itemsCount").get(function () {
  return this.items ? this.items.length : 0;
});

orderSchema.methods.canBeCancelled = function () {
  return (
    [OrderStatus.PENDING, OrderStatus.PROCESSING].includes(this.status) &&
    ![PaymentStatus.COMPLETED, PaymentStatus.REFUNDED].includes(
      this.paymentStatus
    )
  );
};

orderSchema.methods.canBeRefunded = function () {
  return (
    this.status === OrderStatus.COMPLETED &&
    this.paymentStatus === PaymentStatus.COMPLETED &&
    this.completedAt &&
    Date.now() - this.completedAt.getTime() < 30 * 24 * 60 * 60 * 1000
  ); // 30 days
};

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

export default orderSchema;
