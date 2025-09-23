import User from "../models/User.js";
import mongoose from "mongoose";

export const isInWishlist = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    const user = await User.findById(userId).select("wishlist");
    if (!user) return false;

    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    return user.wishlist.some((id) => id.equals(courseObjectId));
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
};

export const getWishlistCount = async (userId: string): Promise<number> => {
  try {
    const user = await User.findById(userId).select("wishlist");
    return user?.wishlist.length || 0;
  } catch (error) {
    console.error("Error getting wishlist count:", error);
    return 0;
  }
};
