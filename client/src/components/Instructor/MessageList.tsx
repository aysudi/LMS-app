import React from "react";
import { motion } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";
import MessageItem from "./MessageItem";

interface MessageListProps {
  filteredMessages: any[];
  selectedMessage: string | null;
  setSelectedMessage: (id: string | null) => void;
  handleMarkAsRead: (id: string) => void;
  handleMarkAsResolved: (id: string) => void;
  isReplying: boolean;
  searchTerm: string;
  t: (key: string) => string;
}

const MessageList: React.FC<MessageListProps> = ({
  filteredMessages,
  selectedMessage,
  setSelectedMessage,
  handleMarkAsRead,
  handleMarkAsResolved,
  isReplying,
  searchTerm,
  t,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {filteredMessages.length === 0 ? (
        <div className="text-center py-16">
          <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("instructor.messages.noMessagesFound")}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? t("instructor.messages.tryAdjustingSearch")
              : t("instructor.messages.messagesFromStudents")}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredMessages.map((message: any) => (
            <MessageItem
              key={message._id}
              message={message}
              isSelected={selectedMessage === message._id}
              onSelect={() =>
                setSelectedMessage(
                  selectedMessage === message._id ? null : message._id
                )
              }
              onMarkAsRead={() => handleMarkAsRead(message._id)}
              onMarkAsResolved={() => handleMarkAsResolved(message._id)}
              isProcessing={isReplying}
              t={t}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MessageList;
