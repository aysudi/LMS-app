import InstructorEarnings from "../models/InstructorEarnings.js";
import mongoose from "mongoose";
import Course from "../models/Course.js";

// Create instructor earnings for an order
export const createInstructorEarningsForOrder = async (order: any) => {
  const earningsPromises = order.items.map(async (item: any) => {
    try {
      // Get course to find instructor
      const course = await Course.findById(item.course);
      if (!course) {
        console.error(`Course not found for item: ${item.course}`);
        return;
      }

      const grossAmount = item.actualPrice;
      // Platform takes 25% commission + 3% payment processing = 28% total, instructor gets 72%
      const platformCommissionRate = 0.25; // 25% platform commission
      const paymentProcessingRate = 0.03; // 3% payment processing fee
      const totalPlatformFeeRate =
        platformCommissionRate + paymentProcessingRate; // 28%

      const platformFee = grossAmount * totalPlatformFeeRate;
      const instructorShare = grossAmount - platformFee;

      // Check if earnings already exist to prevent duplicates
      const existingEarning = await InstructorEarnings.findOne({
        order: order._id,
        course: item.course,
        instructor: course.instructor,
      });

      if (existingEarning) {
        console.log(
          `Earnings already exist for order ${order._id}, course ${item.course}`
        );
        return existingEarning;
      }

      // Create earnings record
      const earning = new InstructorEarnings({
        instructor: course.instructor,
        course: item.course,
        order: order._id,
        student: order.user,
        grossAmount,
        platformFee,
        instructorShare,
        currency: order.currency || "USD",
        payoutStatus: "pending",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });

      const savedEarning = await earning.save();
      console.log(
        `Created instructor earnings for instructor ${course.instructor}, course ${item.course}, amount: ${instructorShare}`
      );
      return savedEarning;
    } catch (error) {
      console.error(
        `Error creating instructor earning for course ${item.course}:`,
        error
      );
      return null;
    }
  });

  return await Promise.all(earningsPromises);
};

// Get instructor total earnings
export const getInstructorTotalEarnings = async (instructorId: string) => {
  const earnings = await InstructorEarnings.aggregate([
    { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
    {
      $group: {
        _id: null,
        totalGross: { $sum: "$grossAmount" },
        totalPlatformFees: { $sum: "$platformFee" },
        totalInstructorShare: { $sum: "$instructorShare" },
        totalPending: {
          $sum: {
            $cond: [
              { $eq: ["$payoutStatus", "pending"] },
              "$instructorShare",
              0,
            ],
          },
        },
        totalPaid: {
          $sum: {
            $cond: [
              { $eq: ["$payoutStatus", "completed"] },
              "$instructorShare",
              0,
            ],
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  return (
    earnings[0] || {
      totalGross: 0,
      totalPlatformFees: 0,
      totalInstructorShare: 0,
      totalPending: 0,
      totalPaid: 0,
      count: 0,
    }
  );
};

// Get instructor earnings by course
export const getInstructorEarningsByCourse = async (
  instructorId: string,
  courseId?: string
) => {
  const matchFilter: any = {
    instructor: new mongoose.Types.ObjectId(instructorId),
  };
  if (courseId) matchFilter.course = courseId;

  return await InstructorEarnings.find(matchFilter)
    .populate("course", "title")
    .populate("student", "firstName lastName email")
    .populate("order", "orderNumber total createdAt")
    .sort({ createdAt: -1 });
};

// Update payout status
export const updatePayoutStatus = async (
  instructorId: string,
  earningIds: string[],
  status: "pending" | "processing" | "completed" | "failed"
) => {
  return await InstructorEarnings.updateMany(
    {
      _id: { $in: earningIds },
      instructor: new mongoose.Types.ObjectId(instructorId),
    },
    {
      payoutStatus: status,
      ...(status === "completed" && { paidAt: new Date() }),
    }
  );
};
