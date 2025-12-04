import { useState } from "react";
import { motion } from "framer-motion";
// @ts-ignore
import { useTranslation } from "react-i18next";
import {
  useInstructorMessages,
  useInstructorMessaging,
} from "../../hooks/useInstructor";
import { useInstructorMessageStats } from "../../hooks/useInstructorMessageStats";
import Loading from "../../components/Common/Loading";
import InstructorStudentConversations from "../../components/Instructor/InstructorStudentConversations";
import MessageStats from "../../components/Instructor/MessageStats";
import MessageFilters from "../../components/Instructor/MessageFilters";
import MessageList from "../../components/Instructor/MessageList";
import ReplyModal from "../../components/Instructor/ReplyModal";
import Pagination from "../../components/Instructor/Pagination";

type MessageStatus = "all" | "unread" | "read" | "resolved";

const InstructorMessages = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "course-messages" | "student-messages"
  >("student-messages");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<MessageStatus>("all");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: messagesData,
    isLoading,
    error,
  } = useInstructorMessages({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Get instructor message statistics for student-instructor messages
  const {
    data: messageStats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useInstructorMessageStats();

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
      console.error(t("instructor.messages.failedToSendReply"), error);
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
            {t("instructor.messages.errorLoadingMessages")}
          </h2>
          <p className="text-gray-600 mt-2">{t("common.retry")}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">
              {t("navigation.messages")}
            </h1>
            <p className="text-gray-600 mt-2">
              {t("instructor.messages.description")}
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("student-messages")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "student-messages"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("instructor.messages.studentMessages")}
              </button>
              <button
                onClick={() => setActiveTab("course-messages")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "course-messages"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("instructor.messages.messagesOverview")}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "student-messages" ? (
          <InstructorStudentConversations />
        ) : (
          <div>
            {/* Message Stats */}
            <MessageStats
              messageStats={messageStats}
              isLoading={isStatsLoading}
              error={statsError}
              t={t}
            />{" "}
            {/* Filters and Search */}
            <MessageFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              t={t}
            />
            {/* Messages List */}
            <MessageList
              filteredMessages={filteredMessages}
              selectedMessage={selectedMessage}
              setSelectedMessage={setSelectedMessage}
              handleMarkAsRead={handleMarkAsRead}
              handleMarkAsResolved={handleMarkAsResolved}
              isReplying={isReplying}
              searchTerm={searchTerm}
              t={t}
            />
            {/* Reply Modal */}
            <ReplyModal
              selectedMessage={selectedMessage}
              replyText={replyText}
              setReplyText={setReplyText}
              setSelectedMessage={setSelectedMessage}
              handleSendReply={handleSendReply}
              isReplying={isReplying}
              t={t}
            />
            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              t={t}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorMessages;
