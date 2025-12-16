import * as Yup from "yup";

const createValidationSchema = (t: any) =>
  Yup.object({
    firstName: Yup.string().required(
      t("instructorApplication.validation.firstNameRequired")
    ),
    lastName: Yup.string().required(
      t("instructorApplication.validation.lastNameRequired")
    ),
    email: Yup.string()
      .email(t("instructorApplication.validation.emailInvalid"))
      .required(t("instructorApplication.validation.emailRequired")),
    phone: Yup.string(),
    bio: Yup.string()
      .min(50, t("instructorApplication.validation.bioMinLength"))
      .max(500, t("instructorApplication.validation.bioMaxLength"))
      .required(t("instructorApplication.validation.bioRequired")),
    expertise: Yup.array()
      .min(1, t("instructorApplication.validation.expertiseMin"))
      .max(10, t("instructorApplication.validation.expertiseMax"))
      .required(t("instructorApplication.validation.expertiseRequired")),
    experience: Yup.string()
      .min(100, t("instructorApplication.validation.experienceMinLength"))
      .max(1000, t("instructorApplication.validation.experienceMaxLength"))
      .required(t("instructorApplication.validation.experienceRequired")),
    education: Yup.string()
      .min(20, t("instructorApplication.validation.educationMinLength"))
      .max(500, t("instructorApplication.validation.educationMaxLength"))
      .required(t("instructorApplication.validation.educationRequired")),
    motivation: Yup.string()
      .min(50, t("instructorApplication.validation.motivationMinLength"))
      .max(500, t("instructorApplication.validation.motivationMaxLength"))
      .required(t("instructorApplication.validation.motivationRequired")),
    sampleCourseTitle: Yup.string().max(
      100,
      t("instructorApplication.validation.courseTitleMaxLength")
    ),
    sampleCourseDescription: Yup.string().max(
      500,
      t("instructorApplication.validation.courseDescriptionMaxLength")
    ),
    portfolio: Yup.string().url(
      t("instructorApplication.validation.portfolioInvalid")
    ),
    linkedIn: Yup.string().url(
      t("instructorApplication.validation.linkedInInvalid")
    ),
    website: Yup.string().url(
      t("instructorApplication.validation.websiteInvalid")
    ),
  });

export default createValidationSchema;
