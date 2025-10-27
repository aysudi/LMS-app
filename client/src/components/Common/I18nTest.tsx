import React from "react";
import { useTranslation } from "react-i18next";

const I18nTest: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2>i18n Test</h2>
      <p>Current language: {i18n.language}</p>
      <p>Test translation: {t("common.loading")}</p>
      <div className="space-x-2">
        <button
          onClick={() => i18n.changeLanguage("en")}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          English
        </button>
        <button
          onClick={() => i18n.changeLanguage("ru")}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Русский
        </button>
        <button
          onClick={() => i18n.changeLanguage("az")}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Azərbaycan
        </button>
      </div>
    </div>
  );
};

export default I18nTest;
