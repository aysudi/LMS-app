import { motion } from "framer-motion";

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    students: number;
  }>;
  formatCurrency: (amount: number) => string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  formatCurrency,
}) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const maxStudents = Math.max(...data.map((d) => d.students));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Revenue & Enrollments
        </h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <span className="text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">New Students</span>
          </div>
        </div>
      </div>

      <div className="h-80 flex items-end justify-between space-x-4 px-4">
        {data.map((item) => (
          <div
            key={item.month}
            className="flex flex-col items-center space-y-2 flex-1"
          >
            <div className="flex items-end space-x-1 w-full h-64">
              <div
                className="bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 cursor-pointer relative group"
                style={{
                  height: `${
                    maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 5
                  }%`,
                  width: "40%",
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 transition-opacity">
                  {formatCurrency(item.revenue)}
                </div>
              </div>
              <div
                className="bg-green-500 rounded-t-lg transition-all duration-500 hover:bg-green-600 cursor-pointer relative group"
                style={{
                  height: `${
                    maxStudents > 0 ? (item.students / maxStudents) * 100 : 5
                  }%`,
                  width: "40%",
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 transition-opacity">
                  {item.students} students
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RevenueChart;
