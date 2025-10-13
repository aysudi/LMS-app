import sidebarItems from "../../constants/sidebarItems";
import { useAuthContext } from "../../context/AuthContext";
import { FaBars, FaBell } from "react-icons/fa";

type HeaderProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isActive: (path: any) => boolean;
};

const Header = ({ setSidebarOpen, isActive, sidebarOpen }: HeaderProps) => {
  const { user } = useAuthContext();

  return (
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
  );
};

export default Header;
