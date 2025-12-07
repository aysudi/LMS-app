import { FaSave } from "react-icons/fa";
import type { CourseFormData } from "../../../types/course.type";
import { useTranslation } from "react-i18next";

const SaveDraftButton = ({
  formData,
  createCourseMutation,
}: {
  formData: CourseFormData;
  createCourseMutation: any;
}) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={() => {
        const formDataToSend = new FormData();

        if (formData.image instanceof File) {
          formDataToSend.append("image", formData.image);
        }
        if (formData.videoPromo instanceof File) {
          formDataToSend.append("videoPromo", formData.videoPromo);
        }

        [
          "tags",
          "learningObjectives",
          "requirements",
          "targetAudience",
        ].forEach((key) => {
          if (formData[key as keyof CourseFormData]) {
            const value = formData[key as keyof CourseFormData];
            if (Array.isArray(value)) {
              const processed = value.filter(Boolean).map(String);
              formDataToSend.append(key, JSON.stringify(processed));
            }
          }
        });

        if (formData.sections.length > 0) {
          formDataToSend.append("sections", JSON.stringify(formData.sections));
        }

        const simpleFields = [
          "title",
          "description",
          "shortDescription",
          "category",
          "subcategory",
          "level",
          "originalPrice",
          "discountPrice",
          "language",
          "certificateProvided",
          "isFree",
        ];

        simpleFields.forEach((field) => {
          const value = formData[field as keyof CourseFormData];
          if (value !== undefined && value !== null) {
            formDataToSend.append(field, String(value));
          }
        });

        formDataToSend.append("isPublished", "false");
        formDataToSend.append("status", "draft");
        createCourseMutation.mutate(formDataToSend);
      }}
      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
    >
      <FaSave className="text-sm" />
      <span>{t("instructor.createCourse.saveDraft")}</span>
    </button>
  );
};

export default SaveDraftButton;
