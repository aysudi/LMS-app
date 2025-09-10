import User from "../models/userModel";
import {
  RegisterUserDto,
  IUser,
  AuthResponse,
  UserProfileDto,
} from "../types/user.types";
import formatMongoData from "../utils/formatMongoData";
import { JWTUtils } from "../utils/jwt.utils";
import { createUserProfile } from "../utils/user.utils";

export const register = async (
  userData: RegisterUserDto,
  avatarUrl?: string
): Promise<AuthResponse> => {
  const existingUser = await User.findOne({
    $or: [{ email: userData.email }, { username: userData.username }],
  });

  if (existingUser) {
    throw new Error("User with this email or username already exists");
  }

  const userDataWithAvatar = {
    ...userData,
    ...(avatarUrl && { avatar: avatarUrl }),
  };

  const user = await User.create(userDataWithAvatar);

  const userProfile = createUserProfile(user);

  const { accessToken, refreshToken } = JWTUtils.generateTokens(user as any);

  return {
    user: formatMongoData(userProfile),
    token: accessToken,
    refreshToken,
  };
};
