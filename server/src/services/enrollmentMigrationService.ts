import Course from "../models/Course";
import User from "../models/User";
import Enrollment from "../models/Enrollment";

// Sync enrollments from Enrollment model to User.enrolledCourses and Course.studentsEnrolled
export const syncEnrollmentData = async () => {
  try {
    console.log("Starting enrollment data synchronization...");

    // Get all active enrollments
    const enrollments = await Enrollment.find({ status: "active" })
      .populate("user", "_id")
      .populate("course", "_id");

    console.log(`Found ${enrollments.length} active enrollments to sync`);

    for (const enrollment of enrollments) {
      const userId = enrollment.user;
      const courseId = enrollment.course;

      if (!userId || !courseId) {
        console.warn(`Skipping invalid enrollment: ${enrollment._id}`);
        continue;
      }

      // Update user's enrolledCourses if not already included
      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId },
      });

      // Update course's studentsEnrolled if not already included
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { studentsEnrolled: userId },
      });
    }

    console.log("Enrollment data synchronization completed successfully!");
    return {
      success: true,
      syncedCount: enrollments.length,
      message: "All enrollments synchronized",
    };
  } catch (error) {
    console.error("Error during enrollment synchronization:", error);
    throw error;
  }
};

// Fix missing enrollments based on User.enrolledCourses
export const syncFromUserEnrolledCourses = async () => {
  try {
    console.log(
      "Syncing from User.enrolledCourses to Course.studentsEnrolled..."
    );

    const users = await User.find({
      enrolledCourses: { $exists: true, $ne: [] },
    });

    let syncCount = 0;
    for (const user of users) {
      for (const courseId of user.enrolledCourses) {
        // Update course's studentsEnrolled
        const result = await Course.findByIdAndUpdate(courseId, {
          $addToSet: { studentsEnrolled: user._id },
        });

        if (result) {
          syncCount++;
        }
      }
    }

    console.log(`Synced ${syncCount} course enrollments from user data`);
    return { success: true, syncCount };
  } catch (error) {
    console.error("Error syncing from user enrolled courses:", error);
    throw error;
  }
};

// Fix missing enrollments based on Course.studentsEnrolled
export const syncFromCourseStudentsEnrolled = async () => {
  try {
    console.log(
      "Syncing from Course.studentsEnrolled to User.enrolledCourses..."
    );

    const courses = await Course.find({
      studentsEnrolled: { $exists: true, $ne: [] },
    });

    let syncCount = 0;
    for (const course of courses) {
      for (const userId of course.studentsEnrolled) {
        // Update user's enrolledCourses
        const result = await User.findByIdAndUpdate(userId, {
          $addToSet: { enrolledCourses: course._id },
        });

        if (result) {
          syncCount++;
        }
      }
    }

    console.log(`Synced ${syncCount} user enrollments from course data`);
    return { success: true, syncCount };
  } catch (error) {
    console.error("Error syncing from course students enrolled:", error);
    throw error;
  }
};

// Complete data synchronization
export const performFullEnrollmentSync = async () => {
  try {
    console.log("=== Starting Full Enrollment Data Synchronization ===");

    const results = {
      enrollmentModel: await syncEnrollmentData(),
      fromUsers: await syncFromUserEnrolledCourses(),
      fromCourses: await syncFromCourseStudentsEnrolled(),
    };

    console.log("=== Full Enrollment Synchronization Completed ===");
    return results;
  } catch (error) {
    console.error("Full sync failed:", error);
    throw error;
  }
};
