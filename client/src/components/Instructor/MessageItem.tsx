import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaBook, FaEllipsisV, FaUser } from "react-icons/fa";
import { HTMLRenderer } from "../../utils/htmlRenderer";

interface MessageItemProps {
  message: any;
  isSelected: boolean;
  onSelect: () => void;
  onMarkAsRead: () => void;
  onMarkAsResolved: () => void;
  isProcessing: boolean;
  t: (key: string) => string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsResolved,
  isProcessing = false,
  t,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.map((n) => n.charAt(0).toUpperCase()).join("");
  };

  const statusColors = {
    unread: "bg-red-100 text-red-800",
    read: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
  };

  return (
    <motion.div
      layout
      className={`p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
        isSelected ? "bg-indigo-50 border-l-4 border-indigo-500" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1" onClick={onSelect}>
          <div className="flex items-center space-x-3 mb-2">
            {message.student.avatar ? (
              <img
                src={message.student.avatar}
                alt={`${message.student.firstName} ${message.student.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {getInitials(
                  `${message.student.firstName} ${message.student.lastName}`
                )}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {message.student.firstName} {message.student.lastName}
              </p>
              <p className="text-sm text-gray-500 flex items-center space-x-2">
                <FaUser className="text-xs" />
                <span>{message.student.email}</span>
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[message.status as keyof typeof statusColors]
              }`}
            >
              {message.status}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2">
            {message.subject}
          </h3>
          <div className="text-gray-600 line-clamp-2">
            <HTMLRenderer content={message.message} />
          </div>

          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <FaClock className="text-xs" />
              <span>{new Date(message.createdAt).toLocaleDateString()}</span>
            </span>
            {message.course && (
              <span className="flex items-center space-x-1">
                <FaBook className="text-xs" />
                <span>{message.course.title}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <FaEllipsisV />
          </button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                {message.status === "unread" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead();
                      setShowActions(false);
                    }}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t("instructor.messages.markAsRead")}
                  </button>
                )}
                {message.status !== "resolved" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsResolved();
                      setShowActions(false);
                    }}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t("instructor.messages.markAsResolved")}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t("instructor.messages.reply")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageItem;
