import bcrypt from "bcrypt";
export const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};
export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
export const generateInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
};
export const getAvatarOrInitials = (avatar, firstName, lastName) => {
    if (avatar && avatar.trim() !== "") {
        return avatar;
    }
    return generateInitials(firstName, lastName);
};
export const getFullName = (firstName, lastName) => {
    return `${firstName} ${lastName}`.trim();
};
export const createUserProfile = (user) => {
    const initials = generateInitials(user.firstName, user.lastName);
    const fullName = getFullName(user.firstName, user.lastName);
    const avatarOrInitials = getAvatarOrInitials(user.avatar, user.firstName, user.lastName);
    return {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        avatarOrInitials,
        initials,
        fullName,
        role: user.role,
        bio: user.bio,
        skills: user.skills || [],
        socialLinks: user.socialLinks || {},
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
    };
};
