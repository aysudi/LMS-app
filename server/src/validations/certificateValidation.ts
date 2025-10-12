import Joi from "joi";

export const certificateGenerationSchema = Joi.object({
  courseId: Joi.string().required().messages({
    "any.required": "Course ID is required",
    "string.empty": "Course ID cannot be empty",
  }),
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
    "string.empty": "User ID cannot be empty",
  }),
  studentName: Joi.string().min(1).max(100).required().messages({
    "any.required": "Student name is required",
    "string.empty": "Student name cannot be empty",
    "string.min": "Student name must be at least 1 character long",
    "string.max": "Student name cannot exceed 100 characters",
  }),
  instructorName: Joi.string().min(1).max(100).required().messages({
    "any.required": "Instructor name is required",
    "string.empty": "Instructor name cannot be empty",
    "string.min": "Instructor name must be at least 1 character long",
    "string.max": "Instructor name cannot exceed 100 characters",
  }),
  userEmail: Joi.string().email().required().messages({
    "any.required": "User email is required",
    "string.email": "Please provide a valid email address",
    "string.empty": "User email cannot be empty",
  }),
  courseName: Joi.string().min(1).max(200).required().messages({
    "any.required": "Course name is required",
    "string.empty": "Course name cannot be empty",
    "string.min": "Course name must be at least 1 character long",
    "string.max": "Course name cannot exceed 200 characters",
  }),
});

export const validateCertificateGeneration = (data: any) => {
  return certificateGenerationSchema.validate(data, { abortEarly: false });
};
