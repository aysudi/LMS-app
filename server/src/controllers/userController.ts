import { Request, Response, NextFunction } from "express";
import { register } from "../services/userService";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../middlewares/upload.middleware";

export const registerUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, username, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role,
    };

    let avatarUrl: string | undefined;

    if (req.file) {
      try {
        const filename = `${Date.now()}_${req.file.originalname}`;
        avatarUrl = await uploadToCloudinary(req.file.buffer, filename);
      } catch (uploadError) {
        console.error("Avatar upload failed:", uploadError);
        res.status(400).json({
          success: false,
          message: "Avatar upload failed",
        });
        return;
      }
    }

    const result = await register(userData, avatarUrl);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};
