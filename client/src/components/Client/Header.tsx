import { useState, useEffect, useRef } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
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
  FaClock,
  FaTrash,
  FaBookmark,
  FaStar,
  FaComments,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { useLogout } from "../../hooks/useAuth";
import { useWishlistHelpers } from "../../hooks/useWishlist";
import { useCartHelpers } from "../../hooks/useCart";
import {
  getSearchSuggestions,
  getSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
  type SearchSuggestion,
  type RecentSearch,
} from "../../services/search.service";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3);

  const { wishlistCount } = useWishlistHelpers();

  const { cartCount } = useCartHelpers();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<RecentSearch[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { user, isAuthenticated, isLoading } = useAuthContext();
  const { mutate: logout } = useLogout();

  const fetchSearchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const [apiResults, recentSearches] = await Promise.all([
        getSearchSuggestions(query),
        getSearchHistory(),
      ]);

      const matchingRecentSearches = recentSearches
        .filter(
          (recent) =>
            recent.query.toLowerCase().includes(query.toLowerCase()) &&
            recent.query.toLowerCase() !== query.toLowerCase()
        )
        .slice(0, 3) // Limit to 3 recent searches
        .map((recent) => ({
          id: `recent-${recent.query}`,
          value: recent.query,
          label: recent.query,
          type: "search" as const,
          metadata: {
            description: `From your recent searches`,
          },
        }));

      const combinedSuggestions = [
        ...matchingRecentSearches,
        ...apiResults.filter(
          (api) =>
            !matchingRecentSearches.some(
              (recent) => recent.value.toLowerCase() === api.value.toLowerCase()
            )
        ),
      ];

      setSuggestions(combinedSuggestions);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const history = await getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error("Failed to fetch search history:", error);
      setSearchHistory([]);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);

    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        fetchSearchSuggestions(value);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchInputFocus = () => {
    setIsSearchFocused(true);
    if (!searchQuery.trim()) {
      fetchSearchHistory();
    }
  };

  const handleSearchInputBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = searchQuery.trim()
      ? suggestions.length
      : searchHistory.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (selectedIndex >= 0) {
        if (searchQuery.trim()) {
          const selectedSuggestion = suggestions[selectedIndex];
          handleSuggestionClick(selectedSuggestion);
        } else {
          const selectedHistory = searchHistory[selectedIndex];
          handleHistoryClick(selectedHistory);
        }
      } else if (searchQuery.trim()) {
        handleSearchSubmit(e);
      }
    } else if (e.key === "Escape") {
      setIsSearchFocused(false);
      setSelectedIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await saveSearchToHistory(searchQuery.trim(), "search");
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSuggestionClick = async (suggestion: SearchSuggestion) => {
    await saveSearchToHistory(suggestion.value, "suggestion", {
      selectedSuggestion: suggestion.id,
    });

    setSearchQuery(suggestion.value);
    setIsSearchFocused(false);

    if (suggestion.type === "search") {
      navigate(`/courses?search=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === "course" && suggestion.metadata?.courseId) {
      navigate(`/course/${suggestion.metadata.courseId}`);
    } else if (suggestion.type === "category") {
      navigate(`/courses?category=${encodeURIComponent(suggestion.value)}`);
    } else if (
      suggestion.type === "instructor" &&
      suggestion.metadata?.instructorId
    ) {
      navigate(`/instructor/${suggestion.metadata.instructorId}`);
    } else {
      navigate(`/courses?search=${encodeURIComponent(suggestion.value)}`);
    }

    setSearchQuery("");
  };

  const handleHistoryClick = async (historyItem: RecentSearch) => {
    setSearchQuery(historyItem.query);
    setIsSearchFocused(false);
    await saveSearchToHistory(historyItem.query, "search");
    navigate(`/courses?search=${encodeURIComponent(historyItem.query)}`);
    setSearchQuery("");
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setSearchHistory([]);
  };

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.id.startsWith("recent-")) {
      return <FaClock className="text-orange-500" />;
    }

    switch (suggestion.type) {
      case "course":
        return <FaBookOpen className="text-blue-500" />;
      case "category":
        return <FaBookmark className="text-green-500" />;
      case "instructor":
        return <FaUser className="text-purple-500" />;
      case "search":
        return <FaSearch className="text-indigo-500" />;
      default:
        return <FaSearch className="text-gray-400" />;
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Free";
    return `$${price.toFixed(2)}`;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <FaStar
            key={i}
            className={`text-xs ${
              i < Math.floor(rating) ? "text-yellow-400" : "text-gray-200"
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }

      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.pathname === "/courses") {
      const urlSearchQuery = searchParams.get("search") || "";
      if (urlSearchQuery !== searchQuery && !isSearchFocused) {
        setSearchQuery(urlSearchQuery);
      }
    } else if (!isSearchFocused) {
      setSearchQuery("");
    }
  }, [location.pathname, searchParams]);

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

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const userMenuItems = userDisplayData
    ? [
        { name: "Profile", path: "/profile", icon: FaUser },
        { name: "Settings", path: "/settings", icon: FaCog },
        ...(userDisplayData.isInstructor()
          ? [
              {
                name: "Instructor",
                path: "/instructor/dashboard",
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

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 min-w-0 mx-4 lg:mx-3 xl:mx-8">
            <div className="w-full relative min-w-0">
              <form
                onSubmit={handleSearchSubmit}
                className="w-full relative min-w-0"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchInputFocus}
                  onBlur={handleSearchInputBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Search courses, instructors..."
                  className="w-full min-w-0 pl-10 pr-4 py-2 lg:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </form>

              {/* Search Dropdown */}
              <AnimatePresence>
                {isSearchFocused &&
                  (searchQuery.trim()
                    ? suggestions.length > 0
                    : searchHistory.length > 0) && (
                    <motion.div
                      ref={searchDropdownRef}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
                    >
                      {searchQuery.trim() ? (
                        // Search Suggestions
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                            Search Suggestions
                          </div>
                          {isLoadingSuggestions ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                            </div>
                          ) : (
                            suggestions.map((suggestion, index) => (
                              <motion.div
                                key={suggestion.id}
                                whileHover={{ backgroundColor: "#f8fafc" }}
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                                className={`px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-gray-50 last:border-b-0 ${
                                  selectedIndex === index
                                    ? "bg-indigo-50"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    {getSuggestionIcon(suggestion)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {suggestion.label}
                                      </p>
                                      <div className="flex items-center space-x-2">
                                        {suggestion.metadata?.rating &&
                                          renderStars(
                                            suggestion.metadata.rating
                                          )}
                                        {suggestion.metadata?.price !==
                                          undefined && (
                                          <span className="text-sm font-semibold text-indigo-600">
                                            {formatPrice(
                                              suggestion.metadata.price
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {suggestion.metadata?.description && (
                                      <p className="text-xs text-gray-500 truncate mt-1">
                                        {suggestion.metadata.description}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                        {suggestion.id.startsWith("recent-")
                                          ? "Recent"
                                          : suggestion.type}
                                      </span>
                                      {suggestion.count && (
                                        <span className="text-xs text-gray-400">
                                          {suggestion.count} results
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      ) : (
                        // Search History
                        <div className="py-2">
                          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Recent Searches
                            </span>
                            {searchHistory.length > 0 && (
                              <button
                                onClick={handleClearHistory}
                                className="text-xs text-red-500 hover:text-red-600 transition-colors duration-150"
                              >
                                <FaTrash className="inline mr-1" />
                                Clear All
                              </button>
                            )}
                          </div>
                          {searchHistory.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                              <FaClock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                              <p className="text-sm">No recent searches</p>
                            </div>
                          ) : (
                            searchHistory.map((historyItem, index) => (
                              <motion.div
                                key={`${historyItem.query}-${historyItem.timestamp}`}
                                whileHover={{ backgroundColor: "#f8fafc" }}
                                onClick={() => handleHistoryClick(historyItem)}
                                className={`px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-gray-50 last:border-b-0 ${
                                  selectedIndex === index
                                    ? "bg-indigo-50"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <FaClock className="text-gray-400 text-sm flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 truncate">
                                      {historyItem.query}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-gray-500">
                                        {new Date(
                                          historyItem.timestamp
                                        ).toLocaleDateString()}
                                      </span>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                        {historyItem.type}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
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
                    onClick={() => navigate("/wishlist")}
                    className="relative p-2 text-gray-700 hover:text-red-500 transition-colors duration-200 group cursor-pointer"
                    title="Wishlist"
                  >
                    <FaHeart className="text-lg" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
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
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </motion.button>

                  {/* Messages */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/messages")}
                    className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 group cursor-pointer"
                    title="Messages"
                  >
                    <FaComments className="text-lg" />
                    {/* Unread messages count - you can add this later */}
                    {/* {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )} */}
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

                  {/* Become Instructor - Only for students */}
                  {!userDisplayData.isInstructor() && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/become-instructor/apply")}
                      className="hidden xl:flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 cursor-pointer"
                      title="Become an Instructor"
                    >
                      <FaChalkboardTeacher className="text-sm" />
                      <span className="font-medium">Teach</span>
                    </motion.button>
                  )}

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
                <form onSubmit={handleSearchSubmit} className="relative">
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

              {/* User Actions (Mobile) */}
              {isAuthenticated && userDisplayData && (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FaHeart />
                      <span>Wishlist</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
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
                    {cartCount > 0 && (
                      <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount > 9 ? "9+" : cartCount}
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

                  {/* Become Instructor - Only for students */}
                  {!userDisplayData.isInstructor() && (
                    <Link
                      to="/become-instructor/apply"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                    >
                      <FaChalkboardTeacher />
                      <span>Become an Instructor</span>
                    </Link>
                  )}

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
