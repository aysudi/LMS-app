import { motion } from "framer-motion";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  subtitle?: string;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  subtitle,
  color,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="text-xl text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {change !== undefined && (
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      changeType === "increase"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {changeType === "increase" ? (
                      <FaArrowUp className="text-xs" />
                    ) : (
                      <FaArrowDown className="text-xs" />
                    )}
                    <span>{Math.abs(Number(change?.toFixed(5)))}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
