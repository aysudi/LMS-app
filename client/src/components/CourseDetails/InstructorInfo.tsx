import { useTranslation } from "react-i18next";
import type { Course } from "../../types/course.type";

const InstructorInfo: React.FC<{ course: Course }> = ({ course }) => {
  const { t } = useTranslation();
  const instructor = course.instructor as any;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          {instructor.avatar ? (
            <img
              src={instructor.avatar}
              alt={`${instructor.firstName} ${instructor.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-3xl">
              {instructor.firstName[0]}
              {instructor.lastName[0]}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {instructor.firstName} {instructor.lastName}
          </h3>
          {instructor.instructorProfile?.headline ? (
            <p className="text-gray-600 mb-4 font-medium">
              {instructor.instructorProfile.headline}
            </p>
          ) : (
            <p className="text-gray-600 mb-4">
              {t("courseDetails.expertInstructor")}
            </p>
          )}
          {instructor.bio ? (
            <p className="text-gray-700 leading-relaxed">{instructor.bio}</p>
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {t("courseDetails.experiencedProfessional", {
                category: course.category,
              })}
            </p>
          )}
        </div>
      </div>

      {instructor.instructorApplication?.applicationData && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">
            Background & Expertise
          </h4>

          {instructor.instructorApplication.applicationData.expertise?.length >
            0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">
                Areas of Expertise
              </h5>
              <div className="flex flex-wrap gap-2">
                {instructor.instructorApplication.applicationData.expertise.map(
                  (skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {instructor.instructorApplication.applicationData.experience && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">
                Professional Experience
              </h5>
              <p className="text-gray-700 leading-relaxed">
                {instructor.instructorApplication.applicationData.experience}
              </p>
            </div>
          )}

          {instructor.instructorApplication.applicationData.education && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Education</h5>
              <p className="text-gray-700 leading-relaxed">
                {instructor.instructorApplication.applicationData.education}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructorInfo;
