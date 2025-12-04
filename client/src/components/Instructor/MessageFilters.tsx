import React from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";

type MessageStatus = "all" | "unread" | "read" | "resolved";

interface MessageFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: MessageStatus;
  setStatusFilter: (status: MessageStatus) => void;
  t: (key: string) => string;
}

const MessageFilters: React.FC<MessageFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  t,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("instructor.messages.searchMessages")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MessageStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">{t("instructor.messages.allMessages")}</option>
            <option value="unread">
              {t("instructor.messages.unreadMessages")}
            </option>
            <option value="read">
              {t("instructor.messages.readMessages")}
            </option>
            <option value="resolved">
              {t("instructor.messages.resolvedMessages")}
            </option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageFilters;
