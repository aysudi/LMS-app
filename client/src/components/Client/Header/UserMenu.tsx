import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronDown,
  FaUser,
  FaEnvelope,
  FaComments,
  FaChalkboardTeacher,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogout } from "../../../hooks/useAuth";

interface UserMenuProps {
  user: any;
  onMenuToggle?: (isOpen: boolean) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onMenuToggle }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const { t } = useTranslation();

  const userDisplayData = {
    avatar: user.avatar,
    avatarOrInitials: user.avatarOrInitials,
    getFullName: () => `${user.firstName} ${user.lastName}`,
    getDisplayName: () => `${user.firstName} ${user.lastName}`,
    getInitials: () => `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`,
    email: user.email,
    isVerified: () => user.isEmailVerified,
    isInstructor: () => user.role === "instructor",
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    const newState = !isUserMenuOpen;
    setIsUserMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  const userMenuItems = [
    { name: t("common.profile"), path: "/profile", icon: FaUser },
    {
      name: t("common.messages"),
      path: "/instructor-messages",
      icon: FaEnvelope,
    },
    {
      name: t("common.discussions"),
      path: "/messages",
      icon: FaComments,
    },
    ...(userDisplayData.isInstructor()
      ? [
          {
            name: t("common.instructor"),
            path: "/instructor/dashboard",
            icon: FaChalkboardTeacher,
          },
        ]
      : []),
    { name: t("common.logout"), action: handleLogout, icon: FaSignOutAlt },
  ];

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className="flex items-center space-x-2 lg:space-x-3 p-1 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer"
      >
        <div className="relative">
          {userDisplayData.avatarOrInitials &&
          userDisplayData.avatarOrInitials.startsWith("http") ? (
            <img
              src={userDisplayData.avatarOrInitials}
              alt={userDisplayData.getFullName()}
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-2 border-white shadow-lg"
            />
          ) : (
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <span className="text-white text-sm lg:text-base font-semibold">
                {userDisplayData.avatarOrInitials ||
                  userDisplayData.getInitials()}
              </span>
            </div>
          )}
          {userDisplayData.isVerified() && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="hidden xl:block text-left">
          <p className="text-sm font-semibold text-gray-900">
            {userDisplayData.getDisplayName()}
          </p>
        </div>
        <FaChevronDown
          className={`hidden lg:block text-gray-400 text-xs transition-transform duration-200 ${
            isUserMenuOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      {/* User Dropdown Menu */}
      <AnimatePresence>
        {isUserMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-900">
                {userDisplayData.getFullName()}
              </p>
              <p className="text-sm text-gray-500">{userDisplayData.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    userDisplayData.isVerified()
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {userDisplayData.isVerified()
                    ? t("common.verified")
                    : t("common.unverified")}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {userMenuItems.map((item) => {
                const IconComponent = item.icon;
                if (item.action) {
                  return (
                    <button
                      key={item.name}
                      onClick={item.action}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <IconComponent className="text-sm" />
                      <span>{item.name}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.path!}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <IconComponent className="text-sm" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
