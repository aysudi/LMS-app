import { Response } from "express";
import { AuthRequest } from "../types/common.types";
import { Types } from "mongoose";
// import Order from "../models/Order";
import Course from "../models/Course";
import User from "../models/User";
import Enrollment from "../models/Enrollment";
import InstructorEarnings from "../models/InstructorEarnings";
import { createInstructorEarningsForOrder } from "../services/instructorEarningsService.js";
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "../types/order.types";
import { EnrollmentStatus } from "../types/enrollment.types";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderListResponse,
  OrderDetailsResponse,
} from "../types/order.types";
import Order from "../models/Order";
import formatMongoData from "../utils/formatMongoData";

// Create a new order (before payment)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, billingAddress, couponCode, notes }: CreateOrderRequest =
      req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one course",
      });
    }

    const courseIds = items.map((item) => item.course);
    const courses = await Course.find({ _id: { $in: courseIds } });

    if (courses.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "Some courses were not found",
      });
    }

    const user = await User.findById(userId).populate("enrolledCourses");
    const alreadyEnrolled = courses.filter((course) =>
      user?.enrolledCourses.some(
        (enrolled: any) => enrolled._id.toString() === course._id.toString()
      )
    );

    if (alreadyEnrolled.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You are already enrolled in: ${alreadyEnrolled
          .map((c) => c.title)
          .join(", ")}`,
      });
    }

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const course = courses.find((c) => c._id.toString() === item.course);
      const price = course?.discountPrice || course?.originalPrice || 0;
      const actualPrice = item.discountPrice || item.price || price;

      subtotal += actualPrice;

      return {
        course: course?._id,
        price: course?.originalPrice || 0,
        discountPrice: course?.discountPrice,
        actualPrice,
      };
    });

    const discount = 0;
    const tax = 0;
    const total = subtotal - discount + tax;

    const order = new Order({
      user: userId,
      items: orderItems,
      subtotal,
      discount,
      tax,
      total,
      currency: "USD",
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      billingAddress,
      couponCode,
      notes,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        source: "web",
      },
    });

    await order.save();

    const response: CreateOrderResponse = {
      success: true,
      data: {
        order,
        // clientSecret would be added here for Stripe integration
      },
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

// Get user's orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .populate(
          "items.course",
          "title image instructor category originalPrice discountPrice"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: userId }),
    ]);

    const response: OrderListResponse = {
      success: true,
      data: {
        orders: formatMongoData(orders),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// Get order details
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "items.course",
      "title image instructor category originalPrice discountPrice duration level"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const response: OrderDetailsResponse = {
      success: true,
      data: formatMongoData(order),
    };

    res.json(response);
  } catch (error: any) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// Cancel order (only if not paid)
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    order.status = OrderStatus.CANCELLED;
    order.paymentStatus = PaymentStatus.CANCELLED;
    order.cancelledAt = new Date();
    await order.save();

    res.json({
      success: true,
      data: order,
      message: "Order cancelled successfully",
    });
  } catch (error: any) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};

// Mock function to complete order (simulate successful payment)
// In real implementation, this would be called by Stripe webhook
export const completeOrder = async (orderId: string, paymentDetails: any) => {
  try {
    const order = await Order.findById(orderId).populate("items.course");

    if (!order) {
      throw new Error("Order not found");
    }

    // Update order status
    order.status = OrderStatus.COMPLETED;
    order.paymentStatus = PaymentStatus.COMPLETED;
    order.completedAt = new Date();
    order.paymentDetails = {
      method: PaymentMethod.CREDIT_CARD,
      transactionId: paymentDetails.transactionId,
      stripePaymentIntentId: paymentDetails.paymentIntentId,
      stripeChargeId: paymentDetails.chargeId,
      last4: paymentDetails.last4,
      cardBrand: paymentDetails.cardBrand,
      receiptUrl: paymentDetails.receiptUrl,
    };

    await order.save();

    // Create enrollments for all courses in the order
    const enrollments = order.items.map(
      (item) =>
        new Enrollment({
          user: order.user,
          course: item.course,
          order: order._id,
          status: EnrollmentStatus.ACTIVE,
          enrolledAt: new Date(),
        })
    );

    await Enrollment.insertMany(enrollments);

    // Create instructor earnings for each course in the order
    await createInstructorEarningsForOrder(order);

    // Update user's enrolled courses and spending
    const courseIds = order.items.map((item) => item.course);
    await User.findByIdAndUpdate(order.user, {
      $push: { enrolledCourses: { $each: courseIds } },
      $inc: { totalSpent: order.total },
      lastPurchaseAt: new Date(),
    });

    return order;
  } catch (error) {
    console.error("Complete order error:", error);
    throw error;
  }
};

// Confirm payment after successful Stripe payment
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentIntentId, paymentMethodId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === OrderStatus.COMPLETED) {
      return res.status(200).json({
        success: true,
        data: {
          order: order,
          message: "Payment already confirmed",
        },
      });
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be processed. Current status: ${order.status}`,
      });
    }

    // Update order with payment details
    order.status = OrderStatus.COMPLETED;
    order.paymentStatus = PaymentStatus.COMPLETED;

    // Use set() method to ensure the subdocument is properly updated
    order.set("paymentDetails", {
      method: PaymentMethod.CREDIT_CARD,
      stripePaymentIntentId: paymentIntentId,
      transactionId: paymentIntentId,
    });

    order.completedAt = new Date();

    await order.save();

    // Create enrollments for all courses in the order
    const enrollments = order.items.map(
      (item) =>
        new Enrollment({
          user: order.user,
          course: item.course,
          order: order._id,
          status: EnrollmentStatus.ACTIVE,
          enrolledAt: new Date(),
        })
    );

    await Enrollment.insertMany(enrollments);

    // Create instructor earnings for each course in the order
    await createInstructorEarningsForOrder(order);

    // Update user's enrolled courses and spending
    const courseIds = order.items.map((item) => item.course);
    await User.findByIdAndUpdate(order.user, {
      $push: { enrolledCourses: { $each: courseIds } },
      $inc: { totalSpent: order.total },
      lastPurchaseAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        order: order,
        message: "Payment confirmed successfully",
      },
    });
  } catch (error: any) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
    });
  }
};
