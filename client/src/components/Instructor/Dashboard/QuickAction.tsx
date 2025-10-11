import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  color,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 text-left group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="text-xl text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <FaChevronRight className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </motion.button>
  );
};

export default QuickAction;
