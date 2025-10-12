import { motion, AnimatePresence } from "framer-motion";
import {
  FaTachometerAlt,
  FaBook,
  FaUsers,
  FaEnvelope,
  FaDollarSign,
  FaChartBar,
  FaCog,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

type Props = {
  sidebarOpen: boolean;
  user: any;
  messageStats: any;
};

const Sidebar = ({ sidebarOpen, user }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

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
      // badge: messageStats?.data?.byStatus?.unread || 0,
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

  const isActiveRoute = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
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
  );
};

export default Sidebar;
