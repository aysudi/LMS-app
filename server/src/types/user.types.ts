import { Document } from "mongoose";

export enum UserRole {
  STUDENT = "student",
  INSTRUCTOR = "instructor",
  ADMIN = "admin",
}

export enum AuthProvider {
  LOCAL = "local",
  GOOGLE = "google",
  GITHUB = "github",
}

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  authProvider: AuthProvider;
  providerId?: string;
  bio?: string;
  skills: string[];
  socialLinks: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  preferences: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    theme: "light" | "dark";
  };
  enrolledCourses: string[];
  createdCourses: string[];
  lastLoginAt?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
  isActive: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UserProfileDto {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  avatar?: string;
  avatarOrInitials: string;
  initials: string;
  fullName: string;
  role: UserRole;
  bio?: string;
  skills: string[];
  socialLinks: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  user: UserProfileDto;
  token: string;
  refreshToken: string;
}
