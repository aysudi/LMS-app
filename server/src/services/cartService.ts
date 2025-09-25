import Cart from "../models/Cart";
import Course from "../models/Course";
import User from "../models/User";
import mongoose from "mongoose";

export const getUserCart = async (userId: string) => {
  let cart = await Cart.findOne({ userId }).populate({
    path: "items.courseId",
    select:
      "title description image category level originalPrice discountPrice isFree instructor rating ratingsCount enrollmentCount createdAt",
    populate: {
      path: "instructor",
      select: "firstName lastName avatar email",
    },
  });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }

  return {
    items: cart.items.map((item) => item.courseId),
    totalItems: cart.items.length,
    totalValue: cart.items.reduce(
      (total, item) => total + item.priceAtTimeOfAdding,
      0
    ),
  };
};

export const addCourseToCart = async (userId: string, courseId: string) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new Error("Invalid course ID format");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  const currentPrice = course.discountPrice || course.originalPrice || 0;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  // Check if course is already in cart
  const existingItem = cart.items.find((item) =>
    item.courseId.equals(courseObjectId)
  );

  if (existingItem) {
    throw new Error("Course already in cart");
  }

  // Add course to cart collection
  cart.items.push({
    courseId: courseObjectId,
    addedAt: new Date(),
    priceAtTimeOfAdding: currentPrice,
  });

  await cart.save();

  // Also add to user's cart array
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { cart: courseObjectId } }, // $addToSet prevents duplicates
      { new: true }
    );

    if (!updatedUser) {
      console.error("User not found when updating cart array");
    }
  } catch (userUpdateError) {
    console.error("Error updating user cart array:", userUpdateError);
  }

  const verifyUser = await User.findById(userId).select("cart");

  return {
    courseId,
    totalItems: cart.items.length,
    totalValue: cart.items.reduce(
      (total, item) => total + item.priceAtTimeOfAdding,
      0
    ),
  };
};

export const removeCourseFromCart = async (
  userId: string,
  courseId: string
) => {
  // Validate course ID
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new Error("Invalid course ID format");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new Error("Cart not found");
  }

  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  // Find and remove the item from cart collection
  const itemIndex = cart.items.findIndex((item) =>
    item.courseId.equals(courseObjectId)
  );

  if (itemIndex === -1) {
    throw new Error("Course not found in cart");
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  // Also remove from user's cart array
  await User.findByIdAndUpdate(
    userId,
    { $pull: { cart: courseObjectId } },
    { new: true }
  );

  return {
    courseId,
    totalItems: cart.items.length,
    totalValue: cart.items.reduce(
      (total, item) => total + item.priceAtTimeOfAdding,
      0
    ),
  };
};

export const clearUserCart = async (userId: string) => {
  const cart = await Cart.findOne({ userId });
  console.log("Clearing cart for user:", userId);
  if (!cart) {
    throw new Error("Cart not found");
  }

  // Clear cart collection
  cart.items = [];
  await cart.save();

  // Also clear user's cart array
  await User.findByIdAndUpdate(userId, { $set: { cart: [] } }, { new: true });

  return {
    totalItems: 0,
    totalValue: 0,
  };
};

export const getCartSummary = async (userId: string) => {
  const cart = await Cart.findOne({ userId });

  return {
    totalItems: cart?.items.length || 0,
    totalValue:
      cart?.items.reduce(
        (total, item) => total + item.priceAtTimeOfAdding,
        0
      ) || 0,
  };
};

export const isInCart = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    const cart = await Cart.findOne({ userId }).select("items");
    if (!cart) return false;

    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    return cart.items.some((item) => item.courseId.equals(courseObjectId));
  } catch (error) {
    console.error("Error checking cart:", error);
    return false;
  }
};

export const getCartCount = async (userId: string): Promise<number> => {
  try {
    const user = await User.findById(userId).select("cart");
    return user?.cart.length || 0;
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
};

// Quick check using user's cart array (faster than checking Cart collection)
export const isInCartQuick = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    const user = await User.findById(userId).select("cart");
    if (!user) return false;

    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    return user.cart.some((id) => id.equals(courseObjectId));
  } catch (error) {
    console.error("Error checking cart:", error);
    return false;
  }
};
