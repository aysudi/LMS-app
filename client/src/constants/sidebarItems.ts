import {
  FaBookOpen,
  FaChartBar,
  FaClipboardList,
  FaCog,
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
    id: "reports",
    label: "Reports & Support",
    icon: FaClipboardList,
    path: "/admin/reports",
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: FaTrophy,
    path: "/admin/certificates",
  },
  {
    id: "communications",
    label: "Communications",
    icon: FaEnvelope,
    path: "/admin/communications",
  },
  {
    id: "settings",
    label: "Platform Settings",
    icon: FaCog,
    path: "/admin/settings",
  },
];

export default sidebarItems;
