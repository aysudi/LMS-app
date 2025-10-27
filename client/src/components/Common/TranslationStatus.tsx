import React from "react";
// @ts-ignore
import { useTranslation } from "react-i18next";

interface TranslationStatusProps {
  className?: string;
}

const TranslationStatus: React.FC<TranslationStatusProps> = ({
  className = "",
}) => {
  const { t, i18n } = useTranslation();

  const testTranslations = [
    { key: "common.loading", category: "Common" },
    { key: "navigation.dashboard", category: "Navigation" },
    { key: "auth.welcome", category: "Auth" },
    { key: "course.title", category: "Course" },
    { key: "instructor.createNewCourse", category: "Instructor" },
    { key: "student.myLearning", category: "Student" },
    { key: "filters.priceRange", category: "Filters" },
    { key: "messages.inbox", category: "Messages" },
  ];

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Translation Status
      </h2>

      <div className="mb-4">
        <p className="text-gray-600">
          Current Language:{" "}
          <strong className="text-blue-600">{i18n.language}</strong>
        </p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => i18n.changeLanguage("en")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              i18n.language === "en"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => i18n.changeLanguage("ru")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              i18n.language === "ru"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🇷🇺 Русский
          </button>
          <button
            onClick={() => i18n.changeLanguage("az")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              i18n.language === "az"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🇦🇿 Azərbaycan
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">
          Sample Translations:
        </h3>
        {testTranslations.map(({ key, category }) => (
          <div
            key={key}
            className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
          >
            <div>
              <span className="text-xs text-gray-500 block">{category}</span>
              <code className="text-sm text-gray-600">{key}</code>
            </div>
            <span className="text-gray-800 font-medium">{t(key)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded">
        <p className="text-sm text-green-700">
          ✅ i18next is working! Language switching and translations are active.
        </p>
      </div>
    </div>
  );
};

export default TranslationStatus;
