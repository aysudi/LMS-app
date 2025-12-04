import React from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaExclamationCircle,
  FaClock,
  FaCheck,
} from "react-icons/fa";
import Loading from "../Common/Loading";

interface MessageStatsProps {
  messageStats:
    | {
        totalMessages: number;
        unreadMessages: number;
        pendingMessages: number;
        resolvedMessages: number;
      }
    | undefined;
  isLoading: boolean;
  error: any;
  t: (key: string) => string;
}

const MessageStats: React.FC<MessageStatsProps> = ({
  messageStats,
  isLoading,
  error,
  t,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          {t("instructor.messages.failedToLoadStatistics")}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FaEnvelope className="text-xl text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("instructor.messages.totalMessages")}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {messageStats?.totalMessages || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-xl">
            <FaExclamationCircle className="text-xl text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("instructor.messages.unread")}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {messageStats?.unreadMessages || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <FaClock className="text-xl text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("instructor.messages.pendingReply")}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {messageStats?.pendingMessages || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <FaCheck className="text-xl text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("instructor.messages.resolved")}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {messageStats?.resolvedMessages || 0}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageStats;
