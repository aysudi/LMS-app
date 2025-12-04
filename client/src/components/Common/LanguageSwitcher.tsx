import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
  { code: "az", name: "Azərbaycan" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("selectedLanguage", languageCode);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
        <Globe size={16} />
        <span className="hidden sm:inline">
          {languages.find((lang) => lang.code === i18n.language)?.name ||
            "English"}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
        <div className="py-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 cursor-pointer ${
                i18n.language === language.code
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }`}
            >
              <span>{language.name}</span>
              {i18n.language === language.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
