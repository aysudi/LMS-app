import mongoose from "mongoose";
import InstructorAnalytics from "../models/InstructorAnalytics.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import UserProgress from "../models/UserProgress.js";

// Track course view for analytics
export const trackCourseView = async (courseId: string, userId?: string) => {
  try {
    const course = await Course.findById(courseId).populate("instructor");
    if (!course) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create analytics record for today
    let analytics = await InstructorAnalytics.findOne({
      instructor: course.instructor._id,
      course: courseId,
      date: today,
    });

    if (!analytics) {
      analytics = new InstructorAnalytics({
        instructor: course.instructor._id,
        course: courseId,
        date: today,
        courseViews: 1,
        newEnrollments: 0,
        totalRevenue: 0,
        completions: 0,
        totalWatchTime: 0,
        averageRating: 0,
        newReviews: 0,
        refunds: 0,
        conversionRate: 0,
      });
    } else {
      analytics.courseViews += 1;
    }

    await analytics.save();
    return analytics;
  } catch (error) {
    console.error("Error tracking course view:", error);
  }
};

// Track enrollment for analytics
export const trackEnrollment = async (
  courseId: string,
  userId: string,
  revenue: number = 0
) => {
  try {
    const course = await Course.findById(courseId).populate("instructor");
    if (!course) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create analytics record for today
    let analytics = await InstructorAnalytics.findOne({
      instructor: course.instructor._id,
      course: courseId,
      date: today,
    });

    if (!analytics) {
      analytics = new InstructorAnalytics({
        instructor: course.instructor._id,
        course: courseId,
        date: today,
        courseViews: 0,
        newEnrollments: 1,
        totalRevenue: revenue,
        completions: 0,
        totalWatchTime: 0,
        averageRating: 0,
        newReviews: 0,
        refunds: 0,
        conversionRate: 0,
      });
    } else {
      analytics.newEnrollments += 1;
      analytics.totalRevenue += revenue;
    }

    // Calculate conversion rate
    if (analytics.courseViews > 0) {
      analytics.conversionRate =
        (analytics.newEnrollments / analytics.courseViews) * 100;
    }

    await analytics.save();
    return analytics;
  } catch (error) {
    console.error("Error tracking enrollment:", error);
  }
};

// Track course completion
export const trackCourseCompletion = async (
  courseId: string,
  userId: string
) => {
  try {
    const course = await Course.findById(courseId).populate("instructor");
    if (!course) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await InstructorAnalytics.findOne({
      instructor: course.instructor._id,
      course: courseId,
      date: today,
    });

    if (!analytics) {
      analytics = new InstructorAnalytics({
        instructor: course.instructor._id,
        course: courseId,
        date: today,
        courseViews: 0,
        newEnrollments: 0,
        totalRevenue: 0,
        completions: 1,
        totalWatchTime: 0,
        averageRating: 0,
        newReviews: 0,
        refunds: 0,
        conversionRate: 0,
      });
    } else {
      analytics.completions += 1;
    }

    await analytics.save();
    return analytics;
  } catch (error) {
    console.error("Error tracking course completion:", error);
  }
};

// Track watch time
export const trackWatchTime = async (
  courseId: string,
  userId: string,
  watchTimeSeconds: number
) => {
  try {
    const course = await Course.findById(courseId).populate("instructor");
    if (!course) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await InstructorAnalytics.findOne({
      instructor: course.instructor._id,
      course: courseId,
      date: today,
    });

    if (!analytics) {
      analytics = new InstructorAnalytics({
        instructor: course.instructor._id,
        course: courseId,
        date: today,
        courseViews: 0,
        newEnrollments: 0,
        totalRevenue: 0,
        completions: 0,
        totalWatchTime: watchTimeSeconds,
        averageRating: 0,
        newReviews: 0,
        refunds: 0,
        conversionRate: 0,
      });
    } else {
      analytics.totalWatchTime += watchTimeSeconds;
    }

    await analytics.save();
    return analytics;
  } catch (error) {
    console.error("Error tracking watch time:", error);
  }
};
