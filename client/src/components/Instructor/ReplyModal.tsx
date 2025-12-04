import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaReply } from "react-icons/fa";

interface ReplyModalProps {
  selectedMessage: string | null;
  replyText: string;
  setReplyText: (text: string) => void;
  setSelectedMessage: (id: string | null) => void;
  handleSendReply: (messageId: string) => void;
  isReplying: boolean;
  t: (key: string) => string;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  selectedMessage,
  replyText,
  setReplyText,
  setSelectedMessage,
  handleSendReply,
  isReplying,
  t,
}) => {
  return (
    <AnimatePresence>
      {selectedMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("instructor.messages.replyToMessage")}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("instructor.messages.yourReply")}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t("instructor.messages.typeReplyHere")}
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setReplyText("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {t("instructor.messages.cancel")}
              </button>
              <button
                onClick={() => handleSendReply(selectedMessage)}
                disabled={!replyText.trim() || isReplying}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                <FaReply className="text-sm" />
                <span>
                  {isReplying
                    ? t("instructor.messages.sending")
                    : t("instructor.messages.sendReply")}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReplyModal;
