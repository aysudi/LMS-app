import { useState } from "react";
import { FaDollarSign, FaGlobe, FaCertificate } from "react-icons/fa";
import type { Course } from "../../../types/course.type";

interface SettingsPanelProps {
  course: Course;
  onUpdate: (changes: Partial<Course>) => void;
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

const SettingsPanel = ({ course, onUpdate }: SettingsPanelProps) => {
  const [formData, setFormData] = useState({
    isFree: course.isFree,
    originalPrice: course.originalPrice,
    discountPrice: course.discountPrice || 0,
    language: course.language,
    level: course.level,
    certificateProvided: course.certificateProvided,
    isPublished: course.isPublished,
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
              Course Pricing
            </h3>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={formData.isFree}
                    onChange={(e) => handleChange("isFree", e.target.checked)}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isFree"
                    className="ml-3 block text-base font-medium text-gray-900"
                  >
                    This is a free course
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-600 ml-8">
                  Free courses help build your audience and establish
                  credibility
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
                          value={formData.originalPrice}
                          onChange={(e) =>
                            handleChange(
                              "originalPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
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
                          value={formData.discountPrice}
                          onChange={(e) =>
                            handleChange(
                              "discountPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
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

          {/* Publication Status */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <FaGlobe className="text-indigo-600" />
              </div>
              Publication Status
            </h3>
            <div className="bg-white rounded-lg p-6 border border-indigo-200">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    handleChange("isPublished", e.target.checked)
                  }
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="isPublished"
                    className="block text-base font-medium text-gray-900 mb-2"
                  >
                    Publish this course
                  </label>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    When published, your course will be visible to students and
                    available for enrollment. Unpublished courses remain in
                    draft mode and are only visible to you.
                  </p>
                  {formData.isPublished ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ Course is published and available to students
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-700 font-medium">
                        ⚠ Course is in draft mode - not visible to students
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
