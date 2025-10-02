import express from "express";
import {
  syncAllEnrollments,
  syncFromEnrollmentModel,
  syncUsersToCoursesOnly,
  syncCoursesToUsersOnly,
} from "../controllers/enrollmentMigrationController";

const adminRouter = express.Router();

// Admin routes for data migration and synchronization
// Note: In production, these should be protected with admin authentication

// Sync all enrollment data (comprehensive)
adminRouter.post("/sync/enrollments/all", syncAllEnrollments);

// Sync only from Enrollment model to User and Course arrays
adminRouter.post("/sync/enrollments/from-model", syncFromEnrollmentModel);

// Sync from User.enrolledCourses to Course.studentsEnrolled
adminRouter.post("/sync/enrollments/users-to-courses", syncUsersToCoursesOnly);

// Sync from Course.studentsEnrolled to User.enrolledCourses  
adminRouter.post("/sync/enrollments/courses-to-users", syncCoursesToUsersOnly);

export default adminRouter;
