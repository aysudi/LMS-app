import { Router } from "express";
import { registerUser, loginUser, verifyEmailController, resendVerificationEmailController, forgotPasswordController, resetPasswordController, getAllUsersController, getUserByIdController, getUserByUsernameController, getCurrentUserController, refreshTokenController, logoutController, } from "../controllers/userController";
import { uploadMiddleware, uploadErrorHandler, } from "../middlewares/upload.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
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
import { registerValidationSchema, loginValidationSchema, resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema, getUsersQuerySchema, getUserByIdSchema, getUserByUsernameSchema, } from "../validations/user.validation";
const userRouter = Router();
// Protected route - must be before other routes to avoid conflicts
userRouter.get("/me", authenticateToken, getCurrentUserController);
userRouter.get("/", validateQuery(getUsersQuerySchema), getAllUsersController);
userRouter.post("/register", uploadMiddleware, uploadErrorHandler, validateRequest(registerValidationSchema), registerUser);
userRouter.post("/login", validateRequest(loginValidationSchema), loginUser);
userRouter.post("/refresh", refreshTokenController);
userRouter.post("/logout", logoutController);
userRouter.get("/verify-email", verifyEmailController);
userRouter.post("/resend-verification", validateRequest(resendVerificationSchema), resendVerificationEmailController);
userRouter.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPasswordController);
userRouter.post("/reset-password", validateRequest(resetPasswordSchema), resetPasswordController);
userRouter.get("/username/:username", validateParams(getUserByUsernameSchema), getUserByUsernameController);
userRouter.get("/:userId", validateParams(getUserByIdSchema), getUserByIdController);
export default userRouter;
