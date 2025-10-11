import { motion } from "framer-motion";

interface TrafficSourcesProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const TrafficSources: React.FC<TrafficSourcesProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Traffic Sources
      </h2>

      {/* Simple Bar Chart */}
      <div className="space-y-4 mb-6">
        {data.map((source) => (
          <div key={source.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {source.name}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {source.value}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${source.value}%`,
                  backgroundColor: source.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Donut Chart Visual */}
      <div className="flex justify-center">
        <div className="relative w-40 h-40">
          <svg
            viewBox="0 0 42 42"
            className="w-full h-full transform -rotate-90"
          >
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            {data.map((source, index) => {
              const strokeDasharray = `${source.value} ${
                100 - source.value
              }`;
              const strokeDashoffset = data
                .slice(0, index)
                .reduce((acc, curr) => acc + curr.value, 0);

              return (
                <circle
                  key={source.name}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={source.color}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">Total</p>
              <p className="text-xs text-gray-600">Traffic</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrafficSources;
