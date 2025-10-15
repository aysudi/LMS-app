import { FaSignOutAlt, FaTimes, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { removeAuthToken } from "../../utils/auth-storage";
import { useAuthContext } from "../../context/AuthContext";
import sidebarItems from "../../constants/sidebarItems";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isActive: (path: any) => boolean;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, isActive }: SidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const handleLogout = () => {
    try {
      removeAuthToken();
      localStorage.removeItem("userData");
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full w-72 flex-col bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900 shadow-2xl border-r border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/70 bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaUserShield className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Skillify Admin</h2>
              <p className="text-slate-300 text-sm">Management Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 lg:hidden"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg transform scale-105"
                    : "text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 hover:scale-102 hover:shadow-md"
                }`}
              >
                <Icon
                  className={`text-xl transition-all duration-300 ${
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-indigo-400"
                  }`}
                />
                <span className="font-semibold text-sm tracking-wide">
                  {item.label}
                </span>
                {active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-sm"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-700/70 p-4 bg-gradient-to-r from-slate-800/30 to-gray-800/30 backdrop-blur-sm">
          <div className="flex items-center space-x-4 mb-4 p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-medium">
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-900/30 hover:to-red-800/30 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-md border border-transparent hover:border-red-700/30"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
