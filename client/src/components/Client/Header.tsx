import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGraduationCap,
  FaHeart,
  FaShoppingCart,
  FaBookOpen,
  FaChalkboardTeacher,
  FaUser,
  FaSearch,
  FaBell,
  FaSignOutAlt,
  FaCog,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaUserCircle,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { useLogout } from "../../hooks/useAuth";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3);
  const [favorites] = useState(5);
  const [cartItems] = useState(2);

  const navigate = useNavigate();
  // const location = useLocation();

  const { user, isAuthenticated, isLoading } = useAuthContext();
  const { mutate: logout } = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const userDisplayData = user
    ? {
        avatar: user.avatar,
        avatarOrInitials: user.avatarOrInitials,
        getFullName: () => `${user.firstName} ${user.lastName}`,
        getDisplayName: () => `${user.firstName} ${user.lastName}`,
        getInitials: () =>
          `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`,
        email: user.email,
        isVerified: () => user.isEmailVerified,
        isInstructor: () => user.role === "instructor",
      }
    : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // const navLinks = [
  //   { name: "Home", path: "/", icon: FaHome },
  //   { name: "Courses", path: "/courses", icon: FaBook },
  // ];

  const userMenuItems = userDisplayData
    ? [
        { name: "Profile", path: "/profile", icon: FaUser },
        { name: "Settings", path: "/settings", icon: FaCog },
        ...(userDisplayData.isInstructor()
          ? [
              {
                name: "Instructor",
                path: "/instructor",
                icon: FaChalkboardTeacher,
              },
            ]
          : []),
        { name: "Logout", action: handleLogout, icon: FaSignOutAlt },
      ]
    : [];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 lg:p-3 rounded-xl shadow-lg">
              <FaGraduationCap className="text-white text-xl" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Skillify
              </h1>
              <p className="text-xs text-gray-500 hidden lg:block">
                Learn. Grow. Excel.
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          {/* <nav className="hidden lg:flex items-center lg:ml-2 xl:ml-6 space-x-2 lg:space-x-4 xl:space-x-8">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-2 px-2 lg:px-3 py-2 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  <IconComponent
                    className={`text-sm transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav> */}

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 min-w-0 mx-4 lg:mx-3 xl:mx-8">
            <form onSubmit={handleSearch} className="w-full relative min-w-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, instructors..."
                className="w-full min-w-0 pl-10 pr-4 py-2 lg:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </form>
          </div>

          {/* Right Side - Auth & User Actions */}
          <div className="flex items-center space-x-1 lg:space-x-2 xl:space-x-4">
            {isAuthenticated && userDisplayData ? (
              // Logged in user
              <>
                {/* User Action Buttons */}
                <div className="hidden lg:flex items-center space-x-1 xl:space-x-3">
                  {/* Favorites */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/favorites")}
                    className="relative p-2 text-gray-700 hover:text-red-500 transition-colors duration-200 group cursor-pointer"
                    title="Favorites"
                  >
                    <FaHeart className="text-lg" />
                    {favorites > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {favorites > 9 ? "9+" : favorites}
                      </span>
                    )}
                  </motion.button>

                  {/* Cart */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/cart")}
                    className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200 group cursor-pointer"
                    title="Shopping Cart"
                  >
                    <FaShoppingCart className="text-lg" />
                    {cartItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {cartItems > 9 ? "9+" : cartItems}
                      </span>
                    )}
                  </motion.button>

                  {/* My Learnings - Hidden on lg, shown on xl */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/my-learning")}
                    className="hidden xl:flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer"
                    title="My Learning"
                  >
                    <FaBookOpen className="text-sm" />
                    <span className="font-medium">My Learning</span>
                  </motion.button>

                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/notifications")}
                    className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                    title="Notifications"
                  >
                    <FaBell className="text-lg" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                        {notifications > 9 ? "9+" : notifications}
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* User Avatar & Dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
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
                          <p className="text-sm text-gray-500">
                            {userDisplayData.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                userDisplayData.isVerified()
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {userDisplayData.isVerified()
                                ? "Verified"
                                : "Unverified"}
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
              </>
            ) : isLoading ? (
              // Loading state - show skeleton or loading indicator
              <div className="flex items-center space-x-3">
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              // Not logged in
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200"
                >
                  Log In
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/auth/register"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="lg:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="md:hidden">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, instructors..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </form>
              </div>

              {/* Navigation Links */}
              {/* <div className="space-y-2">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      <IconComponent className="text-lg" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  );
                })}
              </div> */}

              {/* User Actions (Mobile) */}
              {isAuthenticated && userDisplayData && (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link
                    to="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FaHeart />
                      <span>Favorites</span>
                    </div>
                    {favorites > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {favorites > 9 ? "9+" : favorites}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FaShoppingCart />
                      <span>Shopping Cart</span>
                    </div>
                    {cartItems > 0 && (
                      <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItems > 9 ? "9+" : cartItems}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/my-learning"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    <FaBookOpen />
                    <span>My Learning</span>
                  </Link>

                  <Link
                    to="/notifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FaBell />
                      <span>Notifications</span>
                    </div>
                    {notifications > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications > 9 ? "9+" : notifications}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Auth Links (Mobile) */}
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center p-3 text-gray-700 hover:text-indigo-600 font-medium border border-gray-300 rounded-lg transition-all duration-200"
                  >
                    <FaUserCircle className="mr-2 text-lg" />
                    Log In
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    <FaUser className="mr-2 text-lg" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
