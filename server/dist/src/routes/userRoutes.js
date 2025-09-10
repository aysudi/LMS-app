import { Router } from "express";
import { registerUser } from "../controllers/userController";
import { uploadMiddleware, uploadErrorHandler } from "../middlewares/upload.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { registerValidationSchema } from "../validations/user.validation";
const userRouter = Router();
userRouter.post("/register", uploadMiddleware, uploadErrorHandler, validateRequest(registerValidationSchema), registerUser);
export default userRouter;
