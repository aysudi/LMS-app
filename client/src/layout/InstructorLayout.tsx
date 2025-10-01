import { useState } from "react";
import { Outlet } from "react-router-dom";

import { useAuthContext } from "../context/AuthContext";
import { useMessageStats } from "../hooks/useInstructor";
import Sidebar from "../components/Instructor/Sidebar";
import Header from "../components/Instructor/Header";

const InstructorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthContext();

  // Fetch notification data
  const { data: messageStats } = useMessageStats();

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
