import { getInstructorTotalEarnings, getInstructorEarningsByCourse, updatePayoutStatus } from "../services/instructorEarningsService.js";
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
            data: earnings
        });
    }
    catch (error) {
        console.error("Get instructor earnings error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get instructor earnings"
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
            data: earnings
        });
    }
    catch (error) {
        console.error("Get instructor earnings by course error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get instructor earnings by course"
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
                message: "Earning IDs are required"
            });
        }
        if (!["pending", "processing", "completed", "failed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payout status"
            });
        }
        const result = await updatePayoutStatus(instructorId, earningIds, status);
        res.json({
            success: true,
            data: {
                modifiedCount: result.modifiedCount,
                message: `Updated ${result.modifiedCount} earning records`
            }
        });
    }
    catch (error) {
        console.error("Update payout status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update payout status"
        });
    }
};
