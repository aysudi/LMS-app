import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaClock,
  FaTrash,
  FaBookOpen,
  FaBookmark,
  FaUser,
  FaStar,
} from "react-icons/fa";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getSearchSuggestions,
  getSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
  type SearchSuggestion,
  type RecentSearch,
} from "../../../services/search.service";

interface SearchBarProps {
  onBlur?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onBlur }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<RecentSearch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const fetchSearchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const apiResults = await getSearchSuggestions(query);
      const recentHistory = await getSearchHistory();

      const matchingRecentSearches = recentHistory
        .filter((item) =>
          item.query.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map((item) => ({
          id: `recent-${item.query}`,
          value: item.query,
          label: item.query,
          type: "search" as const,
          count: undefined,
          metadata: undefined,
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
      onBlur?.();
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
    if (location.pathname === "/courses") {
      const urlSearchQuery = searchParams.get("search") || "";
      if (urlSearchQuery !== searchQuery && !isSearchFocused) {
        setSearchQuery(urlSearchQuery);
      }
    } else if (!isSearchFocused) {
      setSearchQuery("");
    }
  }, [location.pathname, searchParams]);

  return (
    <div className="hidden md:flex flex-1 min-w-0 mx-4 lg:mx-3 xl:mx-8">
      <div className="w-full relative min-w-0">
        <form onSubmit={handleSearchSubmit} className="w-full relative min-w-0">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={handleSearchInputFocus}
            onBlur={handleSearchInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={t("common.searchCoursesInstructors")}
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
                      {t("common.searchSuggestions")}
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
                          onClick={() => handleSuggestionClick(suggestion)}
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
                                    renderStars(suggestion.metadata.rating)}
                                  {suggestion.metadata?.price !== undefined && (
                                    <span className="text-sm font-semibold text-indigo-600">
                                      {formatPrice(suggestion.metadata.price)}
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
                                    {suggestion.count} {t("common.results")}
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
                        {t("common.recentSearches")}
                      </span>
                      {searchHistory.length > 0 && (
                        <button
                          onClick={handleClearHistory}
                          className="text-xs text-red-500 hover:text-red-600 transition-colors duration-150"
                        >
                          <FaTrash className="inline mr-1" />
                          {t("common.clearAll")}
                        </button>
                      )}
                    </div>
                    {searchHistory.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <FaClock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm">
                          {t("common.noRecentSearches")}
                        </p>
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
  );
};

export default SearchBar;
