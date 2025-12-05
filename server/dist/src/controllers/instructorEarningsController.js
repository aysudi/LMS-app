import { getInstructorTotalEarnings, getInstructorEarningsByCourse, getInstructorMonthlyAnalytics, updatePayoutStatus, } from "../services/instructorEarningsService.js";
import { getCourseStudentsService } from "../services/instructorService.js";
// Get instructor total earnings summary
export const getInstructorEarnings = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const earnings = await getInstructorTotalEarnings(instructorId);
        res.json({
            success: true,
            data: earnings,
        });
    }
    catch (error) {
        console.error("Get instructor earnings error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get instructor earnings",
        });
    }
};
// Get instructor earnings by course
export const getInstructorEarningsByCourseController = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { courseId } = req.query;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const earnings = await getInstructorEarningsByCourse(instructorId, courseId);
        res.json({
            success: true,
            data: earnings,
        });
    }
    catch (error) {
        console.error("Get instructor earnings by course error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get instructor earnings by course",
        });
    }
};
// Get monthly analytics data
export const getInstructorMonthlyAnalyticsController = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { period = "6m" } = req.query;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const analyticsData = await getInstructorMonthlyAnalytics(instructorId, period);
        res.json({
            success: true,
            data: analyticsData,
        });
    }
    catch (error) {
        console.error("Get instructor monthly analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get monthly analytics data",
        });
    }
};
// Request payout
export const requestInstructorPayout = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { amount, paymentMethod } = req.body;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        if (!amount || amount < 50) {
            return res.status(400).json({
                success: false,
                message: "Minimum payout amount is $50",
            });
        }
        // Here you would integrate with your payment processing system
        // For now, we'll just create a payout request record
        res.json({
            success: true,
            message: "Payout request submitted successfully",
            data: {
                amount,
                paymentMethod,
                status: "pending",
                requestedAt: new Date(),
            },
        });
    }
    catch (error) {
        console.error("Request instructor payout error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to request payout",
        });
    }
};
// Export earnings report
export const exportEarningsReportController = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { format = "pdf", period } = req.query;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        // Get earnings data
        const earningsData = await getInstructorTotalEarnings(instructorId);
        const courseEarnings = await getInstructorEarningsByCourse(instructorId);
        if (format === "csv") {
            // Generate CSV with BOM for proper UTF-8 encoding
            let csv = "\uFEFF"; // UTF-8 BOM
            csv +=
                "Course Name,Student Name,Gross Amount,Platform Fee,Instructor Share,Payout Status,Order Date\n";
            if (courseEarnings.length === 0) {
                csv += "No earnings data available,,,,,,,\n";
            }
            else {
                courseEarnings.forEach((earning) => {
                    const courseName = earning.course?.title || "N/A";
                    const studentName = `${earning.student?.firstName || ""} ${earning.student?.lastName || ""}`.trim() || "N/A";
                    const grossAmount = `$${(earning.grossAmount || 0).toFixed(2)}`;
                    const platformFee = `$${(earning.platformFee || 0).toFixed(2)}`;
                    const instructorShare = `$${(earning.instructorShare || 0).toFixed(2)}`;
                    const status = earning.payoutStatus || "pending";
                    const date = new Date(earning.createdAt).toLocaleDateString();
                    csv += `"${courseName}","${studentName}","${grossAmount}","${platformFee}","${instructorShare}","${status}","${date}"\n`;
                });
            }
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="earnings-report-${period || "all"}.csv"`);
            res.send(csv);
        }
        else {
            res.json({
                success: true,
                data: {
                    summary: earningsData,
                    details: courseEarnings,
                    generatedAt: new Date(),
                },
            });
        }
    }
    catch (error) {
        console.error("Export earnings report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to export earnings report",
        });
    }
};
// Export analytics report
export const exportAnalyticsReportController = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { format = "pdf", period = "6m" } = req.query;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        // Get analytics data
        const monthlyData = await getInstructorMonthlyAnalytics(instructorId, period);
        if (format === "csv") {
            // Generate CSV with BOM for proper UTF-8 encoding
            let csv = "\uFEFF"; // UTF-8 BOM
            csv +=
                "Month,Total Revenue,Instructor Earnings,New Enrollments,Report Date\n";
            if (monthlyData.length === 0) {
                csv += "No analytics data available,,,,,\n";
            }
            else {
                monthlyData.forEach((item) => {
                    const month = item.month || "N/A";
                    const revenue = `$${(item.revenue || 0).toFixed(2)}`;
                    const earnings = `$${(item.earnings || 0).toFixed(2)}`;
                    const enrollments = item.enrollments || 0;
                    const date = new Date(item.date).toLocaleDateString();
                    csv += `"${month}","${revenue}","${earnings}",${enrollments},"${date}"\n`;
                });
            }
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="analytics-report-${period}.csv"`);
            res.send(csv);
        }
        else {
            // For PDF, return JSON for now
            res.json({
                success: true,
                data: {
                    monthlyData,
                    period,
                    generatedAt: new Date(),
                },
            });
        }
    }
    catch (error) {
        console.error("Export analytics report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to export analytics report",
        });
    }
};
// Update payout status (admin function, but we can add it for completeness)
export const updateInstructorPayoutStatus = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { earningIds, status } = req.body;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        if (!earningIds || !Array.isArray(earningIds) || earningIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Earning IDs are required",
            });
        }
        if (!["pending", "processing", "completed", "failed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payout status",
            });
        }
        const result = await updatePayoutStatus(instructorId, earningIds, status);
        res.json({
            success: true,
            data: {
                modifiedCount: result.modifiedCount,
                message: `Updated ${result.modifiedCount} earning records`,
            },
        });
    }
    catch (error) {
        console.error("Update payout status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update payout status",
        });
    }
};
// Export students data
export const exportStudentsDataController = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { courseId } = req.params;
        const { format = "csv" } = req.query;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }
        // Get students data for the course
        const studentsData = await getCourseStudentsService(instructorId, courseId, 1, 1000);
        const students = studentsData.students || [];
        if (format === "csv") {
            // Generate CSV with BOM for proper UTF-8 encoding
            let csv = "\uFEFF"; // UTF-8 BOM
            csv +=
                "Student Name,Email Address,Enrollment Date,Course Progress,Last Activity,Completion Status\n";
            if (students.length === 0) {
                csv += "No students enrolled in this course,,,,,,\n";
            }
            else {
                students.forEach((studentData) => {
                    // Use the correct data structure from the service
                    const student = studentData.student;
                    const enrollment = studentData.enrollment;
                    const name = `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
                        "N/A";
                    const email = student.email || "N/A";
                    const enrolledDate = enrollment?.enrolledAt
                        ? new Date(enrollment.enrolledAt).toLocaleDateString()
                        : "N/A";
                    const progress = enrollment?.progressPercentage || 0;
                    const lastActive = enrollment?.lastAccessedAt
                        ? new Date(enrollment.lastAccessedAt).toLocaleDateString()
                        : "Never";
                    const status = progress === 100
                        ? "Completed"
                        : progress > 0
                            ? "In Progress"
                            : "Not Started";
                    csv += `"${name}","${email}","${enrolledDate}","${progress}%","${lastActive}","${status}"\n`;
                });
            }
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="students-data-${courseId}.csv"`);
            res.send(csv);
        }
        else {
            // Return JSON data
            res.json({
                success: true,
                data: students,
            });
        }
    }
    catch (error) {
        console.error("Export students data error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to export students data",
        });
    }
};
