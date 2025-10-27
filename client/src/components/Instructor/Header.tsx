import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import {
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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogout } from "../../hooks/useAuth";
import LanguageSwitcher from "../Common/LanguageSwitcher";

type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  messageStats?: any;
  user: any;
  onSearch?: (searchTerm: string) => void;
};

const Header = ({
  sidebarOpen,
  setSidebarOpen,
  messageStats,
  user,
  onSearch,
}: Props) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        navigate(
          `/instructor/courses?search=${encodeURIComponent(searchTerm.trim())}`
        );
      }
    },
    [searchTerm, navigate]
  );

  return (
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
            <span className="text-sm text-gray-600">{t("common.home")}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden md:block"
        >
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
          />
        </form>

        {/* Language Switcher */}
        <LanguageSwitcher />

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
              <p className="text-xs text-gray-500">{t("common.instructor")}</p>
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
                    {t("common.profile")}
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
                  <span className="text-sm text-gray-700">
                    {t("common.settings")}
                  </span>
                </button>

                <div className="border-t border-gray-200 mt-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-red-50 transition-colors duration-200 text-red-600"
                >
                  <FaSignOutAlt className="text-red-500" />
                  <span className="text-sm">{t("auth.signOut")}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
