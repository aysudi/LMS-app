import React from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaMinus, FaLightbulb, FaClipboardList, FaUsers } from 'react-icons/fa';

interface CourseDetailsStepProps {
  formData: {
    learningObjectives: string[];
    requirements: string[];
    targetAudience: string[];
    level: "Beginner" | "Intermediate" | "Advanced";
  };
  onArrayFieldAdd: (field: 'learningObjectives' | 'requirements' | 'targetAudience') => void;
  onArrayFieldRemove: (field: 'learningObjectives' | 'requirements' | 'targetAudience', index: number) => void;
  onArrayFieldChange: (field: 'learningObjectives' | 'requirements' | 'targetAudience', index: number, value: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
}

const CourseDetailsStep: React.FC<CourseDetailsStepProps> = ({
  formData,
  onArrayFieldAdd,
  onArrayFieldRemove,
  onArrayFieldChange,
  setFormData,
  errors,
}) => {
  const renderArrayField = (
    field: 'learningObjectives' | 'requirements' | 'targetAudience',
    title: string,
    placeholder: string,
    icon: React.ComponentType<any>,
    description: string
  ) => {
    const Icon = icon;
    
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Icon className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>

        <div className="space-y-3">
          {formData[field].map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => onArrayFieldChange(field, index, e.target.value)}
                  placeholder={`${placeholder} ${index + 1}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                type="button"
                onClick={() => onArrayFieldRemove(field, index)}
                disabled={formData[field].length === 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaMinus className="text-sm" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => onArrayFieldAdd(field)}
            disabled={formData[field].length >= 10}
            className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="text-sm" />
            <span>Add another {title.toLowerCase().slice(0, -1)}</span>
          </button>

          {formData[field].length >= 10 && (
            <p className="text-sm text-amber-600">
              Maximum of 10 items allowed
            </p>
          )}
        </div>

        {errors[field] && (
          <p className="text-sm text-red-600 mt-2">{errors[field]}</p>
        )}
      </div>
    );
  };

  return (
    <motion.div
      key="course-details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Course Details
          </h2>
          <p className="text-gray-600">
            Define what students will learn, what they need to know beforehand, and who this course is for.
          </p>
        </div>

        <div className="space-y-8">
          {/* Course Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Course Level *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <div key={level} className="relative">
                  <input
                    type="radio"
                    id={level}
                    name="level"
                    value={level}
                    checked={formData.level === level}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, level: e.target.value as any }))}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor={level}
                    className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all duration-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-indigo-300"
                  >
                    <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${
                      formData.level === level
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {level === 'Beginner' && '1'}
                      {level === 'Intermediate' && '2'}
                      {level === 'Advanced' && '3'}
                    </div>
                    <span className="font-medium text-gray-900">{level}</span>
                    <span className="text-sm text-gray-500 text-center mt-1">
                      {level === 'Beginner' && 'No prior experience required'}
                      {level === 'Intermediate' && 'Some experience helpful'}
                      {level === 'Advanced' && 'Extensive experience required'}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Objectives */}
          {renderArrayField(
            'learningObjectives',
            'Learning Objectives',
            'What will students learn?',
            FaLightbulb,
            'List the key skills and knowledge students will gain'
          )}

          {/* Requirements */}
          {renderArrayField(
            'requirements',
            'Requirements',
            'What do students need to know?',
            FaClipboardList,
            'List any prerequisites or requirements for taking this course'
          )}

          {/* Target Audience */}
          {renderArrayField(
            'targetAudience',
            'Target Audience',
            'Who is this course for?',
            FaUsers,
            'Describe who would benefit most from this course'
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetailsStep;
