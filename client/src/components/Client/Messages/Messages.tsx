import { motion, AnimatePresence } from "framer-motion";
import { FaComments, FaUserCircle } from "react-icons/fa";
import { t } from "i18next";
import type { CourseMessage as ICourseMessage } from "../../../services/courseMessage.service";
import { useState } from "react";

type Props = {
  messagesResponse: any;
  user: any;
  messagesEndRef: any;
};

const MessagesComponent = ({
  messagesResponse,
  user,
  messagesEndRef,
}: Props) => {
  const [userColors, setUserColors] = useState<Record<string, string>>({});

  const currentMessages = messagesResponse?.data?.messages || [];

  const formatMessageTime = (time: string) => {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMessageFromMe = (message: ICourseMessage) => {
    return message.sender?._id === user?.id;
  };

  const getUserColor = (userId: string) => {
    if (!userColors[userId]) {
      const colors = [
        "#3B82F6",
        "#EF4444",
        "#10B981",
        "#F59E0B",
        "#8B5CF6",
        "#EC4899",
        "#06B6D4",
        "#84CC16",
        "#F97316",
        "#6366F1",
      ];
      const colorIndex =
        userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        colors.length;
      setUserColors((prev) => ({ ...prev, [userId]: colors[colorIndex] }));
      return colors[colorIndex];
    }
    return userColors[userId];
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <AnimatePresence>
        {currentMessages.length === 0 ? (
          <div className="text-center py-16">
            <FaComments className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">{t("messages.noMessagesYet")}</p>
            <p className="text-gray-400 text-sm">
              {t("messages.firstMessage")}
            </p>
          </div>
        ) : (
          currentMessages.map((message: ICourseMessage) => {
            const fromMe = isMessageFromMe(message);

            return (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex items-end space-x-3 ${
                  fromMe ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  {message.sender.avatar ? (
                    <img
                      src={message.sender.avatar}
                      alt={`${message.sender.firstName} ${message.sender.lastName}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUserCircle className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div
                  className={`max-w-xs lg:max-w-md ${
                    fromMe ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      fromMe
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {!fromMe && (
                      <p
                        className="text-xs font-medium mb-1"
                        style={{
                          color: getUserColor(message.sender._id),
                        }}
                      >
                        {message.sender.firstName} {message.sender.lastName}
                      </p>
                    )}
                    {message.messageType === "image" ? (
                      <img
                        src={message.content}
                        alt="Sticker"
                        className="max-w-32 max-h-32 rounded-lg"
                      />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesComponent;
