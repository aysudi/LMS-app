import { Router } from "express";
import { registerUser, loginUser, verifyEmailController, resendVerificationEmailController, forgotPasswordController, resetPasswordController, getAllUsersController, getUserByIdController, getUserByUsernameController, getCurrentUserController, refreshTokenController, logoutController, updateProfileController, changePasswordController, updateAvatarController, banUserController, unbanUserController, } from "../controllers/userController";
import { uploadMiddleware, uploadErrorHandler, } from "../middlewares/upload.middleware";
import { validateJoiRequest } from "../middlewares/validation.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware";
import { registerValidationSchema, loginValidationSchema, resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema, getUsersQuerySchema, getUserByIdSchema, getUserByUsernameSchema, } from "../validations/user.validation";
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        req.validatedQuery = value;
        next();
    };
};
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        req.validatedParams = value;
        next();
    };
};
const userRouter = Router();
// Protected route - must be before other routes to avoid conflicts
userRouter.get("/me", authenticateToken, getCurrentUserController);
userRouter.get("/", validateQuery(getUsersQuerySchema), getAllUsersController);
userRouter.post("/register", uploadMiddleware, uploadErrorHandler, validateJoiRequest(registerValidationSchema), registerUser);
userRouter.post("/login", validateJoiRequest(loginValidationSchema), loginUser);
userRouter.post("/refresh", refreshTokenController);
userRouter.post("/logout", logoutController);
userRouter.get("/verify-email", verifyEmailController);
userRouter.post("/resend-verification", validateJoiRequest(resendVerificationSchema), resendVerificationEmailController);
userRouter.post("/forgot-password", validateJoiRequest(forgotPasswordSchema), forgotPasswordController);
userRouter.post("/reset-password", validateJoiRequest(resetPasswordSchema), resetPasswordController);
userRouter.get("/username/:username", validateParams(getUserByUsernameSchema), getUserByUsernameController);
userRouter.get("/:userId", validateParams(getUserByIdSchema), getUserByIdController);
// Profile management routes - must be authenticated
userRouter.put("/profile", authenticateToken, updateProfileController);
userRouter.put("/change-password", authenticateToken, changePasswordController);
userRouter.put("/avatar", authenticateToken, uploadMiddleware, uploadErrorHandler, updateAvatarController);
// Admin routes for user management
userRouter.post("/:userId/ban", authenticateToken, banUserController);
userRouter.post("/:userId/unban", authenticateToken, unbanUserController);
export default userRouter;
