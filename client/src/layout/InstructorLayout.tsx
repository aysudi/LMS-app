import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTachometerAlt,
  FaBook,
  FaUsers,
  FaEnvelope,
  FaDollarSign,
  FaChartBar,
  FaCog,
  FaBars,
  FaTimes,
  FaBell,
  FaSearch,
  FaSignOutAlt,
  FaUser,
  FaChevronDown,
  FaHome,
} from "react-icons/fa";
import { useAuthContext } from "../context/AuthContext";
import { useLogout } from "../hooks/useAuth";
import { useMessageStats } from "../hooks/useInstructor";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const InstructorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { mutate: logout } = useLogout();

  // Fetch notification data
  const { data: messageStats } = useMessageStats();

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FaTachometerAlt,
      path: "/instructor/dashboard",
    },
    {
      id: "courses",
      label: "My Courses",
      icon: FaBook,
      path: "/instructor/courses",
    },
    {
      id: "students",
      label: "Students",
      icon: FaUsers,
      path: "/instructor/students",
    },
    {
      id: "messages",
      label: "Messages",
      icon: FaEnvelope,
      path: "/instructor/messages",
      badge: messageStats?.data?.byStatus?.unread || 0,
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: FaDollarSign,
      path: "/instructor/earnings",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: FaChartBar,
      path: "/instructor/analytics",
    },
    {
      id: "settings",
      label: "Settings",
      icon: FaCog,
      path: "/instructor/settings",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActiveRoute = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AnimatePresence>
        <motion.div
          initial={false}
          animate={{
            width: sidebarOpen ? "280px" : "80px",
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
          className="bg-white shadow-xl border-r border-gray-200 flex flex-col relative z-30"
        >
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-center border-b border-gray-200">
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FaBook className="text-white text-xl" />
              </div>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-xl font-bold text-gray-800">Skillify</h1>
                  <p className="text-xs text-gray-500">Instructor Portal</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-6">
            <div className="space-y-2 px-4">
              {sidebarItems.map((item) => {
                const isActive = isActiveRoute(item.path);
                const IconComponent = item.icon;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                    }`}
                  >
                    <IconComponent
                      className={`text-xl ${
                        isActive ? "text-white" : "group-hover:text-indigo-600"
                      }`}
                    />

                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex items-center justify-between"
                      >
                        <span className="font-medium">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}

                    {!sidebarOpen && item.badge && item.badge > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </div>
                    )}

                    {/* Tooltip for collapsed sidebar */}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* User Info Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              </div>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Instructor</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-20 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {sidebarOpen ? (
                <FaTimes className="text-gray-600" />
              ) : (
                <FaBars className="text-gray-600" />
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <FaHome className="text-gray-600" />
                <span className="text-sm text-gray-600">Back to Site</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, students..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <FaBell className="text-gray-600 text-xl" />
              {(messageStats?.data?.byStatus?.unread || 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {messageStats?.data?.byStatus?.unread || 0 > 9
                    ? "9+"
                    : messageStats?.data?.byStatus?.unread}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Instructor</p>
                </div>
                <FaChevronDown
                  className={`text-gray-400 transition-transform duration-200 ${
                    profileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/instructor/profile");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FaUser className="text-gray-400" />
                      <span className="text-sm text-gray-700">
                        Profile Settings
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/instructor/settings");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FaCog className="text-gray-400" />
                      <span className="text-sm text-gray-700">Settings</span>
                    </button>

                    <div className="border-t border-gray-200 mt-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-red-50 transition-colors duration-200 text-red-600"
                    >
                      <FaSignOutAlt className="text-red-500" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default InstructorLayout;
