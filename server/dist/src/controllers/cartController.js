import * as cartService from "../services/cartService";
import mongoose from "mongoose";
// Get user's cart
export const getCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        const cartData = await cartService.getUserCart(userId);
        res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            data: cartData.items,
            totalItems: cartData.totalItems,
            totalValue: cartData.totalValue,
        });
    }
    catch (error) {
        console.error("Error getting cart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
// Add course to cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID format",
            });
        }
        await cartService.addCourseToCart(userId, courseId);
        res.status(200).json({
            success: true,
            message: "Course added to cart successfully",
            data: {
                courseId,
            },
        });
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        if (error.message === "Course not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message === "Course already in cart") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
// Remove course from cart
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID format",
            });
        }
        await cartService.removeCourseFromCart(userId, courseId);
        res.status(200).json({
            success: true,
            message: "Course removed from cart successfully",
            data: {
                courseId,
            },
        });
    }
    catch (error) {
        console.error("Error removing from cart:", error);
        if (error.message === "Course not found in cart") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
// Clear entire cart
export const clearCart = async (req, res) => {
    console.log("Clearing cart for user:", req.user?.id);
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        await cartService.clearUserCart(userId);
        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
        });
    }
    catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
// Get cart summary (for header display)
export const getCartSummary = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        const summary = await cartService.getCartSummary(userId);
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        console.error("Error getting cart summary:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
// Check if course is in cart
export const checkInCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID format",
            });
        }
        const isInCart = await cartService.isInCart(userId, courseId);
        res.status(200).json({
            success: true,
            data: { isInCart },
        });
    }
    catch (error) {
        console.error("Error checking cart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
// Get cart count
export const getCartCount = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        const count = await cartService.getCartCount(userId);
        res.status(200).json({
            success: true,
            data: { count },
        });
    }
    catch (error) {
        console.error("Error getting cart count:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
