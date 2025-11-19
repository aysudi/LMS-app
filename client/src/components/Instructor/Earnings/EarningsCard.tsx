import React from "react";
import { useTranslation } from "react-i18next";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

interface EarningsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change?: number;
  changeType?: "increase" | "decrease";
  subtitle?: string;
  color: string;
}

const EarningsCard: React.FC<EarningsCardProps> = ({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  subtitle,
  color,
}) => {
  const { t } = useTranslation();
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
              {changeType === "increase" ? (
                <FaArrowUp className="text-xs" />
              ) : (
                <FaArrowDown className="text-xs" />
              )}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500">
                {t("instructor.earnings.vsLastPeriod")}
              </span>
            </div>
          )}

          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default EarningsCard;
