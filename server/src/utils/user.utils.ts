import bcrypt from "bcrypt";
import { UserProfileDto } from "../types/user.types";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateInitials = (
  firstName: string,
  lastName: string
): string => {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
  return `${firstInitial}${lastInitial}`;
};

export const getAvatarOrInitials = (
  avatar: string | undefined,
  firstName: string,
  lastName: string
): string => {
  if (avatar && avatar.trim() !== "") {
    return avatar;
  }
  return generateInitials(firstName, lastName);
};

export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

export const createUserProfile = (user: any): UserProfileDto => {
  const initials = generateInitials(user.firstName, user.lastName);
  const fullName = getFullName(user.firstName, user.lastName);
  const avatarOrInitials = getAvatarOrInitials(
    user.avatar,
    user.firstName,
    user.lastName
  );

  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    avatarOrInitials,
    initials,
    fullName,
    role: user.role,
    bio: user.bio,
    skills: user.skills || [],
    socialLinks: user.socialLinks || {},
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
};
