import Course from "../models/Course.js";
import User from "../models/User.js";
import { SearchHistory } from "../schemas/searchHistorySchema.js";
export const getSearchSuggestions = async (query) => {
    const { q, limit = 8, includeCategories = true, includeInstructors = true, includeCourses = true, } = query;
    const suggestions = [];
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
                .select("title shortDescription image rating originalPrice discountPrice isFree")
                .limit(Math.ceil(limit * 0.5))
                .lean();
            courses.forEach((course) => {
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
                    $limit: Math.ceil(limit * 0.3),
                },
            ]);
            categories.forEach((category) => {
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
                        courseCount: { $gt: 0 },
                    },
                },
                {
                    $sort: { courseCount: -1, avgRating: -1 },
                },
                {
                    $limit: Math.ceil(limit * 0.2),
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
            instructors.forEach((instructor) => {
                suggestions.push({
                    id: `instructor-${instructor._id}`,
                    value: `${instructor.firstName} ${instructor.lastName}`,
                    label: `${instructor.firstName} ${instructor.lastName}`,
                    type: "instructor",
                    count: instructor.courseCount,
                    metadata: {
                        instructorId: instructor._id.toString(),
                        description: instructor.bio?.substring(0, 100) +
                            (instructor.bio?.length > 100 ? "..." : ""),
                        rating: Math.round((instructor.avgRating || 0) * 10) / 10,
                        image: instructor.avatar,
                    },
                });
            });
        }
        return suggestions
            .sort((a, b) => {
            if (a.type === "course" && b.type !== "course")
                return -1;
            if (b.type === "course" && a.type !== "course")
                return 1;
            const aScore = (a.count || 0) + (a.metadata?.rating || 0) * 10;
            const bScore = (b.count || 0) + (b.metadata?.rating || 0) * 10;
            return bScore - aScore;
        })
            .slice(0, limit);
    }
    catch (error) {
        console.error("Search suggestions error:", error);
        return suggestions;
    }
};
export const saveSearchHistoryService = async (userId, searchData) => {
    try {
        const normalizedQuery = searchData.query.trim().toLowerCase();
        await SearchHistory.findOneAndUpdate({
            user: userId,
        }, {
            $set: {
                query: searchData.query.trim(),
                queryNormalized: normalizedQuery,
                type: searchData.type,
                metadata: searchData.metadata,
                timestamp: new Date(),
            },
            $setOnInsert: {
                user: userId,
            },
        }, { upsert: true });
        const userSearches = await SearchHistory.find({ user: userId })
            .sort({ timestamp: -1 })
            .skip(50);
        if (userSearches.length > 0) {
            await SearchHistory.deleteMany({
                _id: { $in: userSearches.map((s) => s._id) },
            });
        }
    }
    catch (error) {
        console.error("Save search history error:", error);
        throw error;
    }
};
export const getSearchHistory = async (userId, query = {}) => {
    try {
        const { limit = 10, type } = query;
        const filter = { user: userId };
        if (type) {
            filter.type = type;
        }
        const history = await SearchHistory.find(filter)
            .sort({ timestamp: -1 })
            .limit(limit)
            .select("-user")
            .lean();
        console.log("history: ", history);
        return history.map((item) => ({
            _id: item._id.toString(),
            query: item.query,
            type: item.type,
            timestamp: item.createdAt,
            metadata: item.metadata,
        }));
    }
    catch (error) {
        console.error("Get search history error:", error);
        throw new Error("Failed to get search history");
    }
};
export const clearSearchHistory = async (userId) => {
    try {
        await SearchHistory.deleteMany({ user: userId });
    }
    catch (error) {
        console.error("Clear search history error:", error);
        throw new Error("Failed to clear search history");
    }
};
export const getPopularSearches = async (limit = 10) => {
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
    }
    catch (error) {
        console.error("Get popular searches error:", error);
        return [];
    }
};
