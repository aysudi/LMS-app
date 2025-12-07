import {
  FaBook,
  FaGraduationCap,
  FaQuestionCircle,
  FaUsers,
} from "react-icons/fa";

const supportCategories = [
  {
    icon: FaQuestionCircle,
    title: "General Questions",
    description: "Learn more about our platform and courses",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: FaBook,
    title: "Course Support",
    description: "Get help with course content and materials",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FaUsers,
    title: "Account Issues",
    description: "Problems with login, billing, or account settings",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FaGraduationCap,
    title: "Become an Instructor",
    description: "Interested in teaching on our platform?",
    color: "from-orange-500 to-red-500",
  },
];

export default supportCategories;
