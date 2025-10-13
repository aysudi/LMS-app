import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaChartBar,
  FaClipboardList,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserShield,
  FaBookOpen,
  FaTrophy,
  FaEnvelope,
} from "react-icons/fa";
import { useAuthContext } from "../context/AuthContext";
import { removeAuthToken } from "../utils/auth-storage";

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FaHome,
      path: "/admin/dashboard",
    },
    {
      id: "users",
      label: "User Management",
      icon: FaUsers,
      path: "/admin/users",
    },
    {
      id: "instructors",
      label: "Instructor Applications",
      icon: FaUserShield,
      path: "/admin/instructors",
    },
    {
      id: "courses",
      label: "Course Moderation",
      icon: FaBookOpen,
      path: "/admin/courses",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: FaChartBar,
      path: "/admin/analytics",
    },
    {
      id: "reports",
      label: "Reports & Support",
      icon: FaClipboardList,
      path: "/admin/reports",
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: FaTrophy,
      path: "/admin/certificates",
    },
    {
      id: "communications",
      label: "Communications",
      icon: FaEnvelope,
      path: "/admin/communications",
    },
    {
      id: "settings",
      label: "Platform Settings",
      icon: FaCog,
      path: "/admin/settings",
    },
  ];

  const handleLogout = () => {
    try {
      removeAuthToken();
      localStorage.removeItem("userData");
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaUserShield className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Skillify Admin</h2>
                <p className="text-slate-400 text-sm">Control Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors lg:hidden"
            >
              <FaTimes />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className={`text-lg ${active ? "text-white" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-slate-400 text-xs">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all duration-200"
            >
              <FaSignOutAlt />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-margin duration-300 ease-in-out ${
          sidebarOpen ? "ml-72" : "ml-0"
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FaBars />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">
                {sidebarItems.find((item) => isActive(item.path))?.label ||
                  "Admin Dashboard"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <FaBell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
