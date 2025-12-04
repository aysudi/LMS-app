import mongoose from "mongoose";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// Calculate admin revenue (25% of all orders)
export const getAdminAnalyticsService = async (params: any = {}) => {
  const { period = "30d", startDate, endDate } = params;

  let dateFilter: any = {};

  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  } else {
    const now = new Date();
    let daysBack = 30;

    switch (period) {
      case "7d":
        daysBack = 7;
        break;
      case "90d":
        daysBack = 90;
        break;
      case "1y":
        daysBack = 365;
        break;
      default:
        daysBack = 30;
    }

    dateFilter = {
      createdAt: {
        $gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000),
        $lte: now,
      },
    };
  }

  // Calculate platform revenue (25% commission from orders)
  const revenueData = (await Order.find()).reduce(
    (acc, order) => {
      acc.totalGross += order.total;
      acc.totalOrders += 1;
      return acc;
    },
    { totalGross: 0, totalOrders: 0 }
  );

  const revenue = revenueData || { totalGross: 0, totalOrders: 0 };
  const platformCommissionRate = 0.25; // 25% platform commission
  const totalPlatformRevenue = revenue.totalGross * platformCommissionRate;

  const previousPeriodStart = new Date(
    dateFilter.createdAt.$gte.getTime() -
      (dateFilter.createdAt.$lte.getTime() -
        dateFilter.createdAt.$gte.getTime())
  );
  const previousPeriodEnd = dateFilter.createdAt.$gte;

  const previousRevenueData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: previousPeriodStart,
          $lte: previousPeriodEnd,
        },
        status: { $in: ["completed", "processing"] },
      },
    },
    {
      $group: {
        _id: null,
        totalGross: { $sum: "$totalAmount" },
      },
    },
  ]);

  const previousRevenue =
    previousRevenueData[0]?.totalGross * platformCommissionRate || 0;
  const revenueGrowth =
    previousRevenue > 0
      ? ((totalPlatformRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  // Get monthly revenue breakdown
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().getFullYear(), 0, 1), // Start of current year
          $lte: new Date(),
        },
        status: { $in: ["completed", "processing"] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: {
          $sum: { $multiply: ["$totalAmount", platformCommissionRate] },
        },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
    {
      $project: {
        month: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
          },
        },
        revenue: 1,
      },
    },
  ]);

  // Get user statistics
  const userStats = await User.aggregate([
    {
      $facet: {
        total: [{ $count: "total" }],
        thisMonth: [
          {
            $match: {
              createdAt: {
                $gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
          },
          { $count: "total" },
        ],
        lastMonth: [
          {
            $match: {
              createdAt: {
                $gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() - 1,
                  1
                ),
                $lt: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
          },
          { $count: "total" },
        ],
      },
    },
  ]);

  const users = {
    total: userStats[0].total[0]?.total || 0,
    thisMonth: userStats[0].thisMonth[0]?.total || 0,
    lastMonth: userStats[0].lastMonth[0]?.total || 0,
    growth: 0, // Initialize growth property
  };

  users.growth =
    users.lastMonth > 0
      ? ((users.thisMonth - users.lastMonth) / users.lastMonth) * 100
      : 0;

  // Get course statistics
  const courseStats = await Course.aggregate([
    {
      $facet: {
        total: [{ $match: { isPublished: true } }, { $count: "total" }],
        thisMonth: [
          {
            $match: {
              isPublished: true,
              publishedAt: {
                $gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
          },
          { $count: "total" },
        ],
        byCategory: [
          { $match: { isPublished: true } },
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $project: {
              category: "$_id",
              count: 1,
              _id: 0,
            },
          },
        ],
      },
    },
  ]);

  const courses = {
    total: courseStats[0].total[0]?.total || 0,
    thisMonth: courseStats[0].thisMonth[0]?.total || 0,
    lastMonth: 0, // Calculate if needed
    growth: 0, // Calculate if needed
    byCategory: courseStats[0].byCategory || [],
  };

  // Get enrollment statistics
  const enrollmentStats = await Enrollment.aggregate([
    {
      $facet: {
        total: [{ $count: "total" }],
        thisMonth: [
          {
            $match: {
              createdAt: {
                $gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
          },
          { $count: "total" },
        ],
        completed: [{ $match: { status: "completed" } }, { $count: "total" }],
      },
    },
  ]);

  const enrollments = {
    total: enrollmentStats[0].total[0]?.total || 0,
    thisMonth: enrollmentStats[0].thisMonth[0]?.total || 0,
    lastMonth: 0, // Calculate if needed
    growth: 0, // Calculate if needed
    completionRate:
      enrollmentStats[0].total[0]?.total > 0
        ? (enrollmentStats[0].completed[0]?.total /
            enrollmentStats[0].total[0]?.total) *
          100
        : 0,
  };

  return {
    revenue: {
      total: totalPlatformRevenue,
      thisMonth: totalPlatformRevenue, // This should be calculated for actual current month
      lastMonth: previousRevenue,
      growth: revenueGrowth,
      byMonth: monthlyRevenue.map((item) => ({
        month: item.month.toISOString().slice(0, 7),
        revenue: item.revenue,
      })),
    },
    users,
    courses,
    enrollments,
  };
};
