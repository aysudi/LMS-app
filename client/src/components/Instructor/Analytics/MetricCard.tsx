interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change?: number;
  changeType?: "increase" | "decrease";
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  color,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="text-xl text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center space-x-1 text-sm ${
                changeType === "increase" ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>
                {changeType === "increase" ? "+" : "-"}
                {Math.abs(change)}%
              </span>
              <span className="text-gray-500">vs last period</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
