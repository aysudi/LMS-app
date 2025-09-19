import Course from "../models/Course.js";
import User from "../models/User.js";
import { SearchHistory } from "../schemas/searchHistorySchema.js";
import {
  SearchSuggestion,
  SearchQuery,
  SearchHistoryQuery,
  SearchHistory as SearchHistoryType,
} from "../types/search.types.js";

export const getSearchSuggestions = async (
  query: SearchQuery
): Promise<SearchSuggestion[]> => {
  const {
    q,
    limit = 8,
    includeCategories = true,
    includeInstructors = true,
    includeCourses = true,
  } = query;
  const suggestions: SearchSuggestion[] = [];

  if (!q || q.trim().length < 2) {
    return suggestions;
  }

  const searchRegex = new RegExp(q.trim(), "i");

  try {
    // Course suggestions
    if (includeCourses) {
      const courses = await Course.find({
        $and: [
          { isPublished: true },
          {
            $or: [
              { title: searchRegex },
              { shortDescription: searchRegex },
              { tags: { $in: [searchRegex] } },
            ],
          },
        ],
      })
        .populate("instructor", "firstName lastName")
        .select(
          "title shortDescription image rating originalPrice discountPrice isFree"
        )
        .limit(Math.ceil(limit * 0.5)) // Allocate 50% of suggestions to courses
        .lean();

      courses.forEach((course: any) => {
        suggestions.push({
          id: `course-${course._id}`,
          value: course.title,
          label: course.title,
          type: "course",
          metadata: {
            courseId: course._id.toString(),
            image: course.image,
            description: course.shortDescription || undefined,
            rating: course.rating,
            price: course.discountPrice || course.originalPrice,
          },
        });
      });
    }

    // Category suggestions
    if (includeCategories) {
      const categories = await Course.aggregate([
        {
          $match: {
            isPublished: true,
            category: searchRegex,
          },
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: Math.ceil(limit * 0.3), // Allocate 30% to categories
        },
      ]);

      categories.forEach((category: any) => {
        suggestions.push({
          id: `category-${category._id}`,
          value: category._id,
          label: category._id,
          type: "category",
          count: category.count,
          metadata: {
            categoryId: category._id.toLowerCase().replace(/\s+/g, "-"),
            rating: Math.round(category.avgRating * 10) / 10,
          },
        });
      });
    }

    // Instructor suggestions
    if (includeInstructors) {
      const instructors = await User.aggregate([
        {
          $match: {
            role: "instructor",
            $or: [
              { firstName: searchRegex },
              { lastName: searchRegex },
              { bio: searchRegex },
            ],
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "instructor",
            as: "courses",
          },
        },
        {
          $addFields: {
            courseCount: { $size: "$courses" },
            avgRating: { $avg: "$courses.rating" },
          },
        },
        {
          $match: {
            courseCount: { $gt: 0 }, // Only instructors with courses
          },
        },
        {
          $sort: { courseCount: -1, avgRating: -1 },
        },
        {
          $limit: Math.ceil(limit * 0.2), // Allocate 20% to instructors
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            avatar: 1,
            bio: 1,
            courseCount: 1,
            avgRating: 1,
          },
        },
      ]);

      instructors.forEach((instructor: any) => {
        suggestions.push({
          id: `instructor-${instructor._id}`,
          value: `${instructor.firstName} ${instructor.lastName}`,
          label: `${instructor.firstName} ${instructor.lastName}`,
          type: "instructor",
          count: instructor.courseCount,
          metadata: {
            instructorId: instructor._id.toString(),
            description:
              instructor.bio?.substring(0, 100) +
              (instructor.bio?.length > 100 ? "..." : ""),
            rating: Math.round((instructor.avgRating || 0) * 10) / 10,
            image: instructor.avatar,
          },
        });
      });
    }

    // Sort suggestions by relevance (courses first, then by count/rating)
    return suggestions
      .sort((a, b) => {
        // Prioritize courses
        if (a.type === "course" && b.type !== "course") return -1;
        if (b.type === "course" && a.type !== "course") return 1;

        // Then sort by count or rating
        const aScore = (a.count || 0) + (a.metadata?.rating || 0) * 10;
        const bScore = (b.count || 0) + (b.metadata?.rating || 0) * 10;
        return bScore - aScore;
      })
      .slice(0, limit);
  } catch (error) {
    console.error("Search suggestions error:", error);
    return suggestions;
  }
};

export const saveSearchHistory = async (
  userId: string,
  searchData: Omit<SearchHistoryType, "_id" | "user">
): Promise<void> => {
  try {
    await SearchHistory.deleteMany({
      user: userId,
      query: searchData.query.trim(),
    });

    // Save new search
    await SearchHistory.create({
      user: userId,
      ...searchData,
      query: searchData.query.trim(),
    });

    // Keep only the last 50 searches per user
    const userSearches = await SearchHistory.find({ user: userId })
      .sort({ timestamp: -1 })
      .skip(50);

    if (userSearches.length > 0) {
      const searchIdsToDelete = userSearches.map((search) => search._id);
      await SearchHistory.deleteMany({ _id: { $in: searchIdsToDelete } });
    }
  } catch (error) {
    console.error("Save search history error:", error);
    throw new Error("Failed to save search history");
  }
};

export const getSearchHistory = async (
  userId: string,
  query: SearchHistoryQuery = {}
): Promise<SearchHistoryType[]> => {
  try {
    const { limit = 10, type } = query;

    const filter: any = { user: userId };
    if (type) {
      filter.type = type;
    }

    const history = await SearchHistory.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .select("-user")
      .lean();

    return history.map((item: any) => ({
      _id: item._id.toString(),
      query: item.query,
      type: item.type,
      timestamp: item.timestamp,
      metadata: item.metadata,
    }));
  } catch (error) {
    console.error("Get search history error:", error);
    throw new Error("Failed to get search history");
  }
};

export const clearSearchHistory = async (userId: string): Promise<void> => {
  try {
    await SearchHistory.deleteMany({ user: userId });
  } catch (error) {
    console.error("Clear search history error:", error);
    throw new Error("Failed to clear search history");
  }
};

export const getPopularSearches = async (
  limit: number = 10
): Promise<string[]> => {
  try {
    const popular = await SearchHistory.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      },
      {
        $group: {
          _id: "$query",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    return popular.map((item) => item._id);
  } catch (error) {
    console.error("Get popular searches error:", error);
    return [];
  }
};
