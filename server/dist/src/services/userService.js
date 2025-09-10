import User from '../models/userModel';
import { JWTUtils } from '../utils/jwt.utils';
import { createUserProfile } from '../utils/user.utils';
export const register = async (userData, avatarUrl) => {
    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [
            { email: userData.email },
            { username: userData.username }
        ]
    });
    if (existingUser) {
        throw new Error('User with this email or username already exists');
    }
    // Add avatar URL if provided
    const userDataWithAvatar = {
        ...userData,
        ...(avatarUrl && { avatar: avatarUrl })
    };
    // Create new user
    const user = await User.create(userDataWithAvatar);
    // Convert to user profile
    const userProfile = createUserProfile(user);
    // Generate JWT tokens
    const { accessToken, refreshToken } = JWTUtils.generateTokens(user);
    return {
        user: userProfile,
        token: accessToken,
        refreshToken
    };
};
