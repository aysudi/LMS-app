import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaDollarSign,
  FaGlobe,
  FaCertificate,
  FaTrashAlt,
  FaPaperPlane,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import type { Course } from "../../../types/course.type";

interface SettingsPanelProps {
  course: Course;
  onUpdate: (changes: Partial<Course>) => void;
  onSave?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
  onDelete?: () => void;
  onSubmitForApproval?: () => void;
  onSaveAsDraft?: () => void;
}

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Russian",
  "Arabic",
  "Hindi",
  "Portuguese",
  "Italian",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const SettingsPanel = ({
  course,
  onUpdate,
  onSave,
  isSaving,
  hasChanges,
  onDelete,
  onSubmitForApproval,
  onSaveAsDraft,
}: SettingsPanelProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    isFree: course.isFree,
    originalPrice: course.originalPrice,
    discountPrice: course.discountPrice || 0,
    language: course.language,
    level: course.level,
    certificateProvided: course.certificateProvided,
  });

  const handleChange = (field: string, value: any) => {
    const updates = { [field]: value };
    setFormData((prev) => ({ ...prev, ...updates }));
    onUpdate(updates);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-8">
        <div className="space-y-10">
          {/* Pricing */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <FaDollarSign className="text-green-600" />
              </div>
              {t("instructor.editCourse.settings.coursePricing")}
            </h3>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={formData.isFree}
                    onChange={(e) => handleChange("isFree", e.target.checked)}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="isFree"
                    className="ml-3 block text-base font-medium text-gray-900"
                  >
                    {t("instructor.editCourse.settings.freeCourseName")}
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-600 ml-8">
                  {t("instructor.editCourse.settings.freeCourseDescription")}
                </p>
              </div>

              {!formData.isFree && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="originalPrice"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Regular Price ($)
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-lg font-medium">
                            $
                          </span>
                        </div>
                        <input
                          type="number"
                          name="originalPrice"
                          id="originalPrice"
                          value={formData.originalPrice || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              handleChange("originalPrice", 0);
                            } else {
                              handleChange(
                                "originalPrice",
                                parseFloat(value) || 0
                              );
                            }
                          }}
                          className="focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-4 py-3 text-lg border-gray-300 rounded-lg"
                          placeholder="99.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="discountPrice"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Discounted Price ($){" "}
                        <span className="text-gray-500 font-normal">
                          (Optional)
                        </span>
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-lg font-medium">
                            $
                          </span>
                        </div>
                        <input
                          type="number"
                          name="discountPrice"
                          id="discountPrice"
                          value={formData.discountPrice || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              handleChange("discountPrice", 0);
                            } else {
                              handleChange(
                                "discountPrice",
                                parseFloat(value) || 0
                              );
                            }
                          }}
                          className="focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-4 py-3 text-lg border-gray-300 rounded-lg"
                          placeholder="49.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Leave empty if no discount applies
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language & Level */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <FaGlobe className="text-blue-600" />
              </div>
              Course Details
            </h3>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="language"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Course Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    The primary language used in your course content
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="level"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Difficulty Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={(e) => handleChange("level", e.target.value)}
                    className="block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                  >
                    {LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Help students choose the right course for their skill level
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <FaCertificate className="text-purple-600" />
              </div>
              Completion Certificate
            </h3>
            <div className="bg-white rounded-lg p-6 border border-purple-200">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  id="certificateProvided"
                  checked={formData.certificateProvided}
                  onChange={(e) =>
                    handleChange("certificateProvided", e.target.checked)
                  }
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="certificateProvided"
                    className="block text-base font-medium text-gray-900 mb-2"
                  >
                    Provide a completion certificate for this course
                  </label>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Students will receive a professionally designed certificate
                    upon completing all course content and passing any required
                    assessments. Certificates help students showcase their new
                    skills and add value to your course.
                  </p>
                  {formData.certificateProvided && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium">
                        ✓ Certificate enabled - Students will receive a
                        completion certificate
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Status */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <FaGlobe className="text-indigo-600" />
              </div>
              Course Submission
            </h3>
            <div className="bg-white rounded-lg p-6 border border-indigo-200">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    📋 Approval Process
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    All courses must be reviewed and approved by our admin team
                    before they can be published to students. This ensures
                    quality standards and helps maintain the integrity of our
                    platform.
                  </p>
                </div>

                {course.status === "draft" && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      📝 Course Status: Draft
                    </p>
                    <p className="text-sm text-gray-600">
                      Your course is in draft mode. Complete all sections and
                      submit for admin review when ready.
                    </p>
                  </div>
                )}

                {course.status === "pending" && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      ⏳ Course Status: Pending Review
                    </p>
                    <p className="text-sm text-yellow-700">
                      Your course has been submitted and is awaiting admin
                      approval. You'll be notified once the review is complete.
                    </p>
                  </div>
                )}

                {course.status === "approved" && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      ✅ Course Status: Approved
                    </p>
                    <p className="text-sm text-green-700">
                      Congratulations! Your course has been approved and is now
                      available to students.
                    </p>
                  </div>
                )}

                {course.status === "rejected" && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 font-medium mb-2">
                      ❌ Course Status: Rejected
                    </p>
                    <p className="text-sm text-red-700">
                      Your course needs revisions before it can be approved.
                      Please check the feedback and resubmit when ready.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Actions */}
          <div className="space-y-6">
            {/* Course Status Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FaPaperPlane className="text-blue-600" />
                </div>
                Course Status Actions
              </h3>
              <div className="bg-white rounded-lg p-6 border border-blue-200">
                {/* Status Info */}
                <div className=" p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    {course.status === "draft" && (
                      <>
                        <FaSave className="text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800">
                          <strong>Draft Status:</strong> Complete your course
                          content and submit when ready.
                        </span>
                      </>
                    )}
                    {course.status === "pending" && (
                      <>
                        <FaClock className="text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                          <strong>Pending Review:</strong> Your course is being
                          reviewed by our admin team.
                        </span>
                      </>
                    )}
                    {course.status === "approved" && (
                      <>
                        <FaCheckCircle className="text-green-600 mr-2" />
                        <span className="text-sm text-green-800">
                          <strong>Approved:</strong> Your course is live and
                          available to students.
                        </span>
                      </>
                    )}
                    {course.status === "rejected" && (
                      <>
                        <FaExclamationTriangle className="text-red-600 mr-2" />
                        <span className="text-sm text-red-800">
                          <strong>Rejected:</strong> Please review feedback and
                          resubmit.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`grid grid-cols-1 ${
                    course.status === "pending"
                      ? "md:grid-cols-5"
                      : "md:grid-cols-4"
                  } gap-4 mt-5`}
                >
                  {/* Save as Draft */}
                  {course.status === "pending" && onSaveAsDraft && (
                    <div className="flex flex-col">
                      <button
                        onClick={onSaveAsDraft}
                        className="flex items-center text-[0.94rem] justify-center px-1 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer"
                      >
                        <FaSave className="mr-3 text-lg" />
                        <div className="text-left">
                          <div className="font-semibold">Save as Draft</div>
                          <div className="text-sm opacity-75">
                            Return to draft mode
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Submit for Approval */}
                  {course.status === "draft" && onSubmitForApproval && (
                    <div className="flex flex-col">
                      <button
                        onClick={onSubmitForApproval}
                        className="flex items-center justify-center px-1 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
                      >
                        <FaPaperPlane className="mr-3 text-lg" />
                        <div className="text-left">
                          <div className="font-semibold">
                            Submit for Approval
                          </div>
                          <div className="text-sm opacity-90">
                            Send to admin review
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Danger Zone - Delete Course */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <FaExclamationTriangle className="text-red-600" />
                </div>
                Danger Zone
              </h3>
              <div className="bg-white rounded-lg p-6 border border-red-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Delete Course
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Permanently delete this course and all its content. This
                      action cannot be undone. All student progress,
                      enrollments, and course data will be lost forever.
                    </p>
                    <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <FaExclamationTriangle className="text-red-600 mr-2 flex-shrink-0" />
                      <span className="text-sm text-red-800">
                        <strong>Warning:</strong> This action is irreversible
                        and will affect all enrolled students.
                      </span>
                    </div>
                  </div>
                </div>
                {onDelete && (
                  <div className="mt-4 flex-shrink-0">
                    <button
                      onClick={onDelete}
                      className="flex items-center text-[0.94rem] px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
                    >
                      <FaTrashAlt className="mr-2" />
                      Delete Course
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        {onSave && (
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
