import Course from "../models/Course";
import User from "../models/User";
import Enrollment from "../models/Enrollment";

// Sync enrollments from Enrollment model to User.enrolledCourses and Course.studentsEnrolled
export const syncEnrollmentData = async () => {
  try {
    const enrollments = await Enrollment.find({ status: "active" })
      .populate("user", "_id")
      .populate("course", "_id");

    for (const enrollment of enrollments) {
      const userId = enrollment.user;
      const courseId = enrollment.course;

      if (!userId || !courseId) {
        console.warn(`Skipping invalid enrollment: ${enrollment._id}`);
        continue;
      }

      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId },
      });

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
    const users = await User.find({
      enrolledCourses: { $exists: true, $ne: [] },
    });

    let syncCount = 0;
    for (const user of users) {
      for (const courseId of user.enrolledCourses) {
        const result = await Course.findByIdAndUpdate(courseId, {
          $addToSet: { studentsEnrolled: user._id },
        });

        if (result) {
          syncCount++;
        }
      }
    }

    return { success: true, syncCount };
  } catch (error) {
    console.error("Error syncing from user enrolled courses:", error);
    throw error;
  }
};

// Fix missing enrollments based on Course.studentsEnrolled
export const syncFromCourseStudentsEnrolled = async () => {
  try {
    const courses = await Course.find({
      studentsEnrolled: { $exists: true, $ne: [] },
    });

    let syncCount = 0;
    for (const course of courses) {
      for (const userId of course.studentsEnrolled) {
        const result = await User.findByIdAndUpdate(userId, {
          $addToSet: { enrolledCourses: course._id },
        });

        if (result) {
          syncCount++;
        }
      }
    }

    return { success: true, syncCount };
  } catch (error) {
    console.error("Error syncing from course students enrolled:", error);
    throw error;
  }
};

// Complete data synchronization
export const performFullEnrollmentSync = async () => {
  try {
    const results = {
      enrollmentModel: await syncEnrollmentData(),
      fromUsers: await syncFromUserEnrolledCourses(),
      fromCourses: await syncFromCourseStudentsEnrolled(),
    };

    return results;
  } catch (error) {
    console.error("Full sync failed:", error);
    throw error;
  }
};
