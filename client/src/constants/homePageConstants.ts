import {
  FaUsers,
  FaGraduationCap,
  FaTrophy,
  FaLightbulb,
  FaCode,
  FaGlobe,
  FaChartLine,
  FaPalette,
  FaBriefcase,
  FaCamera,
  FaMusic,
  FaLanguage,
  FaDumbbell,
  FaCookieBite,
  FaBook,
  FaFlask,
} from "react-icons/fa";

// Hero section stats configuration
export const HERO_STATS = [
  {
    icon: FaUsers,
    value: "50K+",
    labelKey: "home.stats.activeStudents",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FaGraduationCap,
    value: "1K+",
    labelKey: "home.stats.expertCourses",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: FaTrophy,
    value: "100+",
    labelKey: "home.stats.industryExperts",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FaLightbulb,
    value: "24/7",
    labelKey: "home.stats.learningSupport",
    color: "from-orange-500 to-red-500",
  },
];

// Category icons mapping
export const CATEGORY_ICONS: Record<string, any> = {
  Programming: FaCode,
  "Web Development": FaGlobe,
  "Data Science": FaChartLine,
  Design: FaPalette,
  Business: FaBriefcase,
  Photography: FaCamera,
  Marketing: FaChartLine,
  Music: FaMusic,
  Languages: FaLanguage,
  Health: FaDumbbell,
  Cooking: FaCookieBite,
  Literature: FaBook,
  Science: FaFlask,
  Technology: FaCode,
  Arts: FaPalette,
  default: FaGraduationCap,
};

// Color palettes for dynamic category sections
export const COLOR_PALETTES = [
  {
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    buttonColor: "text-blue-600 hover:text-blue-700",
    hoverBg: "hover:bg-blue-50",
  },
  {
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    buttonColor: "text-purple-600 hover:text-purple-700",
    hoverBg: "hover:bg-purple-50",
  },
  {
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    buttonColor: "text-green-600 hover:text-green-700",
    hoverBg: "hover:bg-green-50",
  },
  {
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    buttonColor: "text-orange-600 hover:text-orange-700",
    hoverBg: "hover:bg-orange-50",
  },
  {
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600",
    buttonColor: "text-pink-600 hover:text-pink-700",
    hoverBg: "hover:bg-pink-50",
  },
  {
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    buttonColor: "text-indigo-600 hover:text-indigo-700",
    hoverBg: "hover:bg-indigo-50",
  },
  {
    bgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
    buttonColor: "text-emerald-600 hover:text-emerald-700",
    hoverBg: "hover:bg-emerald-50",
  },
  {
    bgColor: "bg-violet-100",
    iconColor: "text-violet-600",
    buttonColor: "text-violet-600 hover:text-violet-700",
    hoverBg: "hover:bg-violet-50",
  },
  {
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
    buttonColor: "text-red-600 hover:text-red-700",
    hoverBg: "hover:bg-red-50",
  },
  {
    bgColor: "bg-cyan-100",
    iconColor: "text-cyan-600",
    buttonColor: "text-cyan-600 hover:text-cyan-700",
    hoverBg: "hover:bg-cyan-50",
  },
  {
    bgColor: "bg-amber-100",
    iconColor: "text-amber-600",
    buttonColor: "text-amber-600 hover:text-amber-700",
    hoverBg: "hover:bg-amber-50",
  },
  {
    bgColor: "bg-gray-100",
    iconColor: "text-gray-600",
    buttonColor: "text-gray-600 hover:text-gray-700",
    hoverBg: "hover:bg-gray-50",
  },
];

// Animation configurations
export const ANIMATION_CONFIG = {
  heroTitle: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  },
  heroStats: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.2 },
  },
  categories: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.6 },
  },
  sections: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.7 },
  },
  trending: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.9 },
  },
};
