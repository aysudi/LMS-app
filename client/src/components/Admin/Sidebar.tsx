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
  );
};

export default Sidebar;
