import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaEnvelope,
  FaReply,
  FaCheck,
  FaExclamationCircle,
  FaClock,
  FaUser,
  FaBook,
  FaEllipsisV,
} from "react-icons/fa";
import { useInstructorMessages } from "../../hooks/useInstructor";
import { useInstructorMessaging } from "../../hooks/useInstructorHelpers";
import Loading from "../../components/Common/Loading";

type MessageStatus = "all" | "unread" | "read" | "resolved";

const InstructorMessages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<MessageStatus>("all");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);

  // Fetch messages
  const {
    data: messagesData,
    isLoading,
    error,
  } = useInstructorMessages({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Helper hooks for message actions
  const { handleReply, handleMarkAsRead, handleMarkAsResolved, isReplying } =
    useInstructorMessaging();

  const messages = messagesData?.data?.messages || [];
  const totalPages = messagesData?.data?.pagination?.totalPages || 1;

  const handleSendReply = async (messageId: string) => {
    if (!replyText.trim()) return;

    try {
      await handleReply(messageId, { message: replyText });
      setReplyText("");
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  };

  const filteredMessages = messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${message.student.firstName} ${message.student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Error loading messages
          </h2>
          <p className="text-gray-600 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">
              Communicate with your students and manage inquiries
            </p>
          </div>
        </motion.div>

        {/* Message Stats */}
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
                  Total Messages
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.length}
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
                <p className="text-sm font-medium text-gray-500">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter((m) => m.status === "unread").length}
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
                  Pending Reply
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter((m) => m.status === "read").length}
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
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter((m) => m.status === "resolved").length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
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
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as MessageStatus)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Messages List */}
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
                No messages found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Messages from students will appear here"}
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
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Reply Modal */}
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
                  Reply to Message
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Type your reply here..."
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
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendReply(selectedMessage)}
                    disabled={!replyText.trim() || isReplying}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                  >
                    <FaReply className="text-sm" />
                    <span>{isReplying ? "Sending..." : "Send Reply"}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center mt-8"
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pageNum
                        ? "text-white bg-indigo-600 border border-indigo-600"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Message Item Component
interface MessageItemProps {
  message: any;
  isSelected: boolean;
  onSelect: () => void;
  onMarkAsRead: () => void;
  onMarkAsResolved: () => void;
  isProcessing: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsResolved,
  isProcessing = false,
}) => {
  const [showActions, setShowActions] = useState(false);

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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {message.student.firstName?.[0]}
              {message.student.lastName?.[0]}
            </div>
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
          <p className="text-gray-600 line-clamp-2">{message.message}</p>

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
                    Mark as Read
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
                    Mark as Resolved
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
                  Reply
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorMessages;
