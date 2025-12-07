import React from "react";
import { useTranslation } from "react-i18next";
import { FaUser, FaGraduationCap, FaCog } from "react-icons/fa";
import { GrAchievement } from "react-icons/gr";

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { t } = useTranslation();

  const tabs = [
    {
      id: "overview",
      label: t("profile.tabs.overview"),
      shortLabel: "Overview",
      icon: FaUser,
    },
    {
      id: "courses",
      label: t("profile.tabs.myLearning"),
      shortLabel: "Courses",
      icon: FaGraduationCap,
    },
    {
      id: "achievements",
      label: t("profile.tabs.achievements"),
      shortLabel: "Achievements",
      icon: GrAchievement,
    },
    {
      id: "settings",
      label: t("profile.tabs.settings"),
      shortLabel: "Settings",
      icon: FaCog,
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 sm:scrollbar-none">
        <div className="flex min-w-max px-2 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-1 sm:gap-2 whitespace-nowrap min-w-0 ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-700 bg-purple-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="text-xs sm:text-sm flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default ProfileTabs;
