import mongoose from "mongoose";
import { AuthProvider, UserRole } from "../types/user.types.js";
const socialLinksSchema = new mongoose.Schema({
    website: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    twitter: { type: String, trim: true },
}, { versionKey: false });
const preferencesSchema = new mongoose.Schema({
    emailNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
}, { versionKey: false });
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: [2, "First name must be at least 2 characters"],
        maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        minlength: [2, "Last name must be at least 2 characters"],
        maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email",
        ],
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username cannot exceed 30 characters"],
        match: [
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores",
        ],
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    avatar: {
        type: String,
        default: null,
    },
    public_id: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.STUDENT,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    authProvider: {
        type: String,
        enum: Object.values(AuthProvider),
        default: AuthProvider.LOCAL,
    },
    providerId: {
        type: String,
        default: null,
        sparse: true,
    },
    socketId: {
        type: String,
        default: null,
        sparse: true,
    },
    bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
        trim: true,
    },
    skills: [
        {
            type: String,
            trim: true,
        },
    ],
    socialLinks: {
        type: socialLinksSchema,
        default: () => ({}),
    },
    preferences: {
        type: preferencesSchema,
        default: () => ({}),
    },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
    createdCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
    searchHistory: [
        {
            query: {
                type: String,
                trim: true,
            },
            category: {
                type: String,
                trim: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    viewedCourses: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    lastLoginAt: {
        type: Date,
    },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    premium: { type: Boolean, default: false },
    isActive: {
        type: Boolean,
        default: true,
    },
    // Payment & Learning related fields
    totalSpent: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalCoursesCompleted: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalLearningTime: {
        type: Number,
        default: 0,
        min: 0, // in minutes
    },
    certificatesEarned: {
        type: Number,
        default: 0,
        min: 0,
    },
    stripeCustomerId: {
        type: String,
        sparse: true,
    },
    preferredCurrency: {
        type: String,
        default: "USD",
        uppercase: true,
        minlength: 3,
        maxlength: 3,
    },
    lastPurchaseAt: {
        type: Date,
    },
    emailVerificationToken: {
        type: String,
        select: false,
    },
    emailVerificationExpires: {
        type: Date,
        select: false,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ providerId: 1, authProvider: 1 });
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });
export default userSchema;
