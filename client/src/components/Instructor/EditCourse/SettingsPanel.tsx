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
  });

  const handleChange = (field: string, value: any) => {
    const updates = { [field]: value };
    setFormData((prev) => ({ ...prev, ...updates }));
    onUpdate(updates);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="space-y-8">
          {/* Pricing */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <FaDollarSign className="inline-block mr-2" />
              Pricing
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => handleChange("isFree", e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isFree"
                  className="ml-2 block text-sm text-gray-900"
                >
                  This is a free course
                </label>
              </div>

              {!formData.isFree && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="originalPrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Regular Price ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="originalPrice"
                        id="originalPrice"
                        value={formData.originalPrice}
                        onChange={(e) =>
                          handleChange(
                            "originalPrice",
                            parseFloat(e.target.value)
                          )
                        }
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="discountPrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Discounted Price ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="discountPrice"
                        id="discountPrice"
                        value={formData.discountPrice}
                        onChange={(e) =>
                          handleChange(
                            "discountPrice",
                            parseFloat(e.target.value)
                          )
                        }
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language & Level */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <FaGlobe className="inline-block mr-2" />
              Course Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700"
                >
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700"
                >
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Certificate */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <FaCertificate className="inline-block mr-2" />
              Certificate
            </h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="certificateProvided"
                checked={formData.certificateProvided}
                onChange={(e) =>
                  handleChange("certificateProvided", e.target.checked)
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="certificateProvided"
                className="ml-2 block text-sm text-gray-900"
              >
                Provide a completion certificate for this course
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Students will receive a certificate upon completing all course
              content and passing any required assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
