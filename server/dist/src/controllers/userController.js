import { register } from "../services/userService";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from '../middlewares/upload.middleware';
export const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, username, email, password, role } = req.body;
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        // Prepare user data
        const userData = {
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            role
        };
        let avatarUrl;
        // Handle file upload if present
        if (req.file) {
            try {
                const filename = `${Date.now()}_${req.file.originalname}`;
                avatarUrl = await uploadToCloudinary(req.file.buffer, filename);
            }
            catch (uploadError) {
                console.error('Avatar upload failed:', uploadError);
                res.status(400).json({
                    success: false,
                    message: 'Avatar upload failed'
                });
                return;
            }
        }
        // Register user
        const result = await register(userData, avatarUrl);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
};
