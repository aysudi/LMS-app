import User from "../models/User.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";
import formatMongoData from "../utils/formatMongoData.js";
export const getWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId)
            .populate({
            path: "wishlist",
        })
            .select("wishlist");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Wishlist retrieved successfully",
            data: formatMongoData(user.wishlist),
        });
    }
    catch (error) {
        console.error("Error getting wishlist:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
export const addToWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID format",
            });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const courseObjectId = new mongoose.Types.ObjectId(courseId);
        if (user.wishlist.some((id) => id.equals(courseObjectId))) {
            return res.status(400).json({
                success: false,
                message: "Course is already in wishlist",
            });
        }
        // Check if user is already enrolled in the course
        // if (user.enrolledCourses.some((id) => id.equals(courseObjectId))) {
        //   return res.status(400).json({
        //     success: false,
        //     message: "Cannot add enrolled course to wishlist",
        //   });
        // }
        // Add course to wishlist
        user.wishlist.push(courseObjectId);
        await user.save();
        res.status(200).json({
            success: true,
            message: "Course added to wishlist successfully",
            data: {
                courseId,
            },
        });
    }
    catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID format",
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const courseObjectId = new mongoose.Types.ObjectId(courseId);
        if (!user.wishlist.some((id) => id.equals(courseObjectId))) {
            return res.status(400).json({
                success: false,
                message: "Course not found in wishlist",
            });
        }
        user.wishlist = user.wishlist.filter((id) => !id.equals(courseObjectId));
        await user.save();
        res.status(200).json({
            success: true,
            message: "Course removed from wishlist successfully",
            data: {
                courseId,
            },
        });
    }
    catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
