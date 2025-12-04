import {
  FaBookOpen,
  FaChartBar,
  FaEnvelope,
  FaHome,
  FaTrophy,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";

const sidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: FaHome,
    path: "/admin/dashboard",
  },
  {
    id: "users",
    label: "User Management",
    icon: FaUsers,
    path: "/admin/users",
  },
  {
    id: "instructors",
    label: "Instructor Applications",
    icon: FaUserShield,
    path: "/admin/instructors",
  },
  {
    id: "courses",
    label: "Course Moderation",
    icon: FaBookOpen,
    path: "/admin/courses",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: FaChartBar,
    path: "/admin/analytics",
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: FaTrophy,
    path: "/admin/certificates",
  },
  {
    id: "contacts",
    label: "Contact Messages",
    icon: FaEnvelope,
    path: "/admin/contacts",
  },
];

export default sidebarItems;
