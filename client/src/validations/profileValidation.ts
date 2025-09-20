import * as Yup from "yup";

const profileValidationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .required("Last name is required"),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .required("Username is required"),
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  bio: Yup.string().max(500, "Bio cannot exceed 500 characters"),
  skills: Yup.array().of(Yup.string()),
  socialLinks: Yup.object({
    website: Yup.string().url("Please enter a valid URL"),
    linkedin: Yup.string().url("Please enter a valid LinkedIn URL"),
    github: Yup.string().url("Please enter a valid GitHub URL"),
    twitter: Yup.string().url("Please enter a valid Twitter URL"),
  }),
});

export default profileValidationSchema;
