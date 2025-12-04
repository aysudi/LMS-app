import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthContext } from "../../context/AuthContext";
import Logo from "./Header/Logo";
import SearchBar from "./Header/SearchBar";
import UserActions from "./Header/UserActions";
import UserMenu from "./Header/UserMenu";
import AuthButtons from "./Header/AuthButtons";
import MobileMenu from "./Header/MobileMenu";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, isLoading } = useAuthContext();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search submission - this logic should be moved to SearchBar component
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      // Handle clicks outside menus to close them
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
          <Logo />

          {/* Search Bar */}
          <SearchBar />

          {/* Right Side - Auth & User Actions */}
          <div className="flex items-center space-x-1 lg:space-x-2 xl:space-x-4">
            {isAuthenticated && user ? (
              // Logged in user
              <>
                {/* User Action Buttons */}
                <UserActions isInstructor={user.role === "instructor"} />

                {/* User Avatar & Dropdown */}
                <UserMenu user={user} />
              </>
            ) : isLoading ? (
              // Loading state - show skeleton or loading indicator
              <div className="flex items-center space-x-3">
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              // Not logged in
              <AuthButtons />
            )}

            {/* Mobile Menu Button */}
            <MobileMenu
              isAuthenticated={isAuthenticated}
              user={user}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
