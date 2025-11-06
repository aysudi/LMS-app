import {
  FaBook,
  FaAward,
  FaDownload,
  FaInfinity,
  FaMobile,
  FaTv,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
  FaCheckCircle,
  FaList,
  FaUser,
  FaStar,
  FaExclamationTriangle,
  FaQuestionCircle,
} from "react-icons/fa";

// Course includes items configuration
export const COURSE_INCLUDES_ITEMS = [
  {
    icon: FaTv,
    labelKey: "courseDetails.onDemandVideo",
    getValue: (course: any, formatDuration: (seconds: number) => string) =>
      formatDuration(course.totalDuration),
  },
  {
    icon: FaDownload,
    labelKey: "courseDetails.downloadableResources",
    getValue: () => "12", // This would come from course data
  },
  {
    icon: FaInfinity,
    labelKey: "courseDetails.fullLifetimeAccess",
    getValue: () => null,
  },
  {
    icon: FaMobile,
    labelKey: "courseDetails.accessOnMobileAndTV",
    getValue: () => null,
  },
  {
    icon: FaAward,
    labelKey: "courseDetails.certificateOfCompletion",
    getValue: () => null,
  },
];

// Course requirements icons
export const REQUIREMENT_ICONS = {
  beginner: FaCheckCircle,
  intermediate: FaExclamationTriangle,
  advanced: FaQuestionCircle,
  default: FaCheckCircle,
};

// Share platform configurations
export const SHARE_PLATFORMS = [
  {
    name: "twitter",
    icon: FaTwitter,
    color: "bg-blue-400 hover:bg-blue-500",
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "facebook",
    icon: FaFacebook,
    color: "bg-blue-600 hover:bg-blue-700",
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "linkedin",
    icon: FaLinkedin,
    color: "bg-blue-700 hover:bg-blue-800",
    getUrl: (url: string, _: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
  },
  {
    name: "whatsapp",
    icon: FaWhatsapp,
    color: "bg-green-500 hover:bg-green-600",
    getUrl: (url: string, title: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        title + " " + url
      )}`,
  },
];

// Animation configurations
export const ANIMATION_CONFIG = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.5 },
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.3 },
  },
};

// Tab configuration
export const COURSE_TABS = [
  {
    id: "overview",
    labelKey: "courseDetails.overview",
    icon: FaBook,
  },
  {
    id: "curriculum",
    labelKey: "courseDetails.curriculum",
    icon: FaList,
  },
  {
    id: "instructor",
    labelKey: "courseDetails.instructor",
    icon: FaUser,
  },
  {
    id: "reviews",
    labelKey: "courseDetails.reviews",
    icon: FaStar,
  },
];

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Responsive grid configurations
export const GRID_CONFIGS = {
  main: {
    mobile: "grid-cols-1",
    tablet: "lg:grid-cols-3",
    desktop: "xl:grid-cols-4",
  },
  content: {
    mobile: "col-span-1",
    tablet: "lg:col-span-2",
    desktop: "xl:col-span-3",
  },
  sidebar: {
    mobile: "col-span-1",
    tablet: "lg:col-span-1",
    desktop: "xl:col-span-1",
  },
};
