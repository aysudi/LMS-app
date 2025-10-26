import { useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { useAuthContext } from "../context/AuthContext";
import { useMessageStats } from "../hooks/useInstructor";
import Sidebar from "../components/Instructor/Sidebar";
import Header from "../components/Instructor/Header";

const InstructorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notification data
  const { data: messageStats } = useMessageStats();

  const handleSearch = useCallback(
    (searchTerm: string) => {
      // Determine where to navigate based on current location
      if (location.pathname.includes("/courses")) {
        // If already on courses page, update the URL with search parameter
        const params = new URLSearchParams(location.search);
        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        } else {
          params.delete("search");
        }
        navigate(`${location.pathname}?${params.toString()}`, {
          replace: true,
        });
      } else {
        // Navigate to courses page with search
        if (searchTerm.trim()) {
          navigate(
            `/instructor/courses?search=${encodeURIComponent(
              searchTerm.trim()
            )}`
          );
        }
      }
    },
    [navigate, location]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        user={user}
        messageStats={messageStats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          messageStats={messageStats}
          user={user}
          onSearch={handleSearch}
        />

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
