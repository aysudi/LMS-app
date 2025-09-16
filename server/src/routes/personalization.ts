import express, { Request, Response } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import User from "../models/User";
import Course from "../models/Course";

const router = express.Router();

// Add course to wishlist
router.post(
  "/wishlist/add/:courseId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { courseId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if already in wishlist
      if (user.wishlist.includes(courseId as any)) {
        return res.status(400).json({ message: "Course already in wishlist" });
      }

      user.wishlist.push(courseId as any);
      await user.save();

      res.json({ message: "Course added to wishlist" });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Remove course from wishlist
router.delete(
  "/wishlist/remove/:courseId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { courseId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const index = user.wishlist.findIndex((id) => id.toString() === courseId);
      if (index > -1) {
        user.wishlist.splice(index, 1);
      }
      await user.save();

      res.json({ message: "Course removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get user's wishlist
router.get(
  "/wishlist",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId).populate({
        path: "wishlist",
        populate: {
          path: "instructor",
          select: "firstName lastName",
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user.wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Add to search history
router.post(
  "/search-history",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { query, category } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove duplicate if exists
      const existingIndex = user.searchHistory.findIndex(
        (search) => search.query === query && search.category === category
      );
      if (existingIndex !== -1) {
        user.searchHistory.splice(existingIndex, 1);
      }

      // Add new search to beginning
      user.searchHistory.unshift({
        query,
        category,
        timestamp: new Date(),
      } as any);

      // Keep only last 50 searches
      while (user.searchHistory.length > 50) {
        user.searchHistory.pop();
      }

      await user.save();

      res.json({ message: "Search history updated" });
    } catch (error) {
      console.error("Error updating search history:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get search history
router.get(
  "/search-history",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user.searchHistory.slice(0, 10)); // Return last 10 searches
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Add viewed course
router.post(
  "/viewed/:courseId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { courseId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove if already exists
      const existingIndex = user.viewedCourses.findIndex(
        (viewed) => viewed.course?.toString() === courseId
      );
      if (existingIndex !== -1) {
        user.viewedCourses.splice(existingIndex, 1);
      }

      // Add to beginning
      user.viewedCourses.unshift({
        course: courseId as any,
        timestamp: new Date(),
      } as any);

      // Keep only last 20 viewed courses
      while (user.viewedCourses.length > 20) {
        user.viewedCourses.pop();
      }

      await user.save();

      res.json({ message: "Viewed course recorded" });
    } catch (error) {
      console.error("Error recording viewed course:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get personalized recommendations
router.get(
  "/recommendations",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId)
        .populate("enrolledCourses")
        .populate("wishlist")
        .populate("viewedCourses.course");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const enrolledCategories = user.enrolledCourses
        .map((course) => (course as any).category)
        .filter(Boolean);

      const searchCategories = user.searchHistory
        .map((search) => search.category)
        .filter(Boolean);

      const viewedCategories = user.viewedCourses
        .map((viewed) => (viewed.course as any)?.category)
        .filter(Boolean);

      const interestCategories = [
        ...new Set([
          ...enrolledCategories,
          ...searchCategories,
          ...viewedCategories,
        ]),
      ];

      // Get enrolled and wishlisted course IDs
      const excludeIds = [
        ...user.enrolledCourses.map((c) => (c as any)._id),
        ...user.wishlist,
      ];

      let recommendations: any[] = [];
      if (interestCategories.length > 0) {
        recommendations = await Course.find({
          category: { $in: interestCategories },
          _id: { $nin: excludeIds },
        })
          .populate("instructor", "firstName lastName")
          .sort({ rating: -1, enrollmentCount: -1 })
          .limit(10);
      }

      const popularCourses = await Course.find({
        _id: { $nin: excludeIds },
      })
        .populate("instructor", "firstName lastName")
        .sort({ enrollmentCount: -1, rating: -1 })
        .limit(8);

      const freeCourses = await Course.find({
        isFree: true,
        _id: { $nin: excludeIds },
      })
        .populate("instructor", "firstName lastName")
        .sort({ rating: -1, enrollmentCount: -1 })
        .limit(6);

      res.json({
        recommended:
          recommendations.length > 0
            ? recommendations
            : popularCourses.slice(0, 6),
        popular: popularCourses,
        free: freeCourses,
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
