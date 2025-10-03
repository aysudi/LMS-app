import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTimes, FaHashtag } from 'react-icons/fa';

interface BasicInformationStepProps {
  formData: {
    title: string;
    description: string;
    shortDescription: string;
    category: string;
    subcategory: string;
    tags: string[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  onTagAdd: (tag: string) => void;
  onTagRemove: (index: number) => void;
}

const CATEGORIES = [
  "Development",
  "Business", 
  "Design",
  "Marketing",
  "Photography",
  "Music",
  "Health & Fitness",
  "Teaching & Academics",
  "Personal Development",
  "Technology",
];

const SUBCATEGORIES: Record<string, string[]> = {
  Development: ["Web Development", "Mobile Development", "Data Science", "Machine Learning", "Software Engineering", "Game Development"],
  Business: ["Entrepreneurship", "Management", "Finance", "Marketing Strategy", "Sales", "Operations"],
  Design: ["Graphic Design", "UX/UI Design", "Web Design", "Interior Design", "Fashion Design", "3D Design"],
  Marketing: ["Digital Marketing", "Social Media", "Content Marketing", "SEO", "Email Marketing", "Advertising"],
  Photography: ["Portrait Photography", "Landscape Photography", "Wedding Photography", "Street Photography", "Commercial Photography"],
  Music: ["Music Production", "Singing", "Guitar", "Piano", "Music Theory", "Audio Engineering"],
  "Health & Fitness": ["Yoga", "Fitness Training", "Nutrition", "Mental Health", "Meditation", "Sports"],
  "Teaching & Academics": ["Language Learning", "Math", "Science", "History", "Literature", "Test Prep"],
  "Personal Development": ["Leadership", "Productivity", "Communication", "Time Management", "Motivation", "Life Coaching"],
  Technology: ["Cloud Computing", "Cybersecurity", "DevOps", "AI/ML", "Blockchain", "IoT"],
};

const BasicInformationStep: React.FC<BasicInformationStepProps> = ({
  formData,
  setFormData,
  errors,
  onTagAdd,
  onTagRemove,
}) => {
  const [newTag, setNewTag] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onTagAdd(newTag);
      setNewTag('');
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <motion.div
      key="basic-info"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Basic Information
          </h2>
          <p className="text-gray-600">
            Let's start with the fundamental details of your course. This information will help students understand what your course is about.
          </p>
        </div>

        <div className="space-y-8">
          {/* Course Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter an engaging course title"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.title.length}/100 characters
              </p>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <input
              type="text"
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              placeholder="A brief, compelling description of your course"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              maxLength={150}
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.shortDescription.length}/150 characters
            </p>
          </div>

          {/* Full Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide a detailed description of your course. What will students learn? How will it benefit them?"
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-2">{errors.description}</p>
            )}
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  category: e.target.value,
                  subcategory: '' // Reset subcategory when category changes
                }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-2">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                disabled={!formData.category}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select a subcategory</option>
                {formData.category && SUBCATEGORIES[formData.category]?.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Add tags to help students find your course. You can add up to 10 tags.
            </p>
            
            {/* Tag Input */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative flex-1">
                <FaHashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={tagInputRef}
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Enter a tag"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  maxLength={30}
                  disabled={formData.tags.length >= 10}
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim() || formData.tags.length >= 10}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPlus className="text-sm" />
                <span>Add</span>
              </button>
            </div>

            {/* Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700 border border-indigo-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => onTagRemove(index)}
                      className="ml-2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {formData.tags.length >= 10 && (
              <p className="text-sm text-amber-600 mt-2">
                Maximum number of tags reached (10/10)
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BasicInformationStep;
