import React, { useState } from "react";
import {
  Search,
  MessageCircle,
  Clock,
  CheckCircle,
  User,
  Book,
  ChevronRight,
} from "lucide-react";
import { useInstructorConversations } from "../../hooks/useStudentInstructorMessages";
import LoadingSpinner from "../UI/LoadingSpinner";
import ConversationView from "../Client/ConversationView";
import type { ConversationSummary } from "../../services/studentInstructorMessage.service";
import HTMLRenderer from "../../utils/htmlRenderer";
import { t } from "i18next";

const InstructorStudentConversations: React.FC = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unread" | "resolved"
  >("all");

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.map((n) => n.charAt(0).toUpperCase()).join("");
  };

  const { data: conversations, isLoading } = useInstructorConversations();

  const filteredConversations = conversations?.filter((conversation) => {
    const matchesSearch =
      conversation.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.student?.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conversation.course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" &&
        conversation.unreadCount &&
        conversation.unreadCount > 0) ||
      (statusFilter === "resolved" && conversation.status === "resolved");

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (conversation: ConversationSummary) => {
    if (conversation.status === "resolved") {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    }
    return <Clock className="h-4 w-4 text-orange-500" />;
  };

  const getStatusText = (conversation: ConversationSummary) => {
    if (conversation.status === "resolved") return "Resolved";
    if (conversation.unreadCount && conversation.unreadCount > 0)
      return `${conversation.unreadCount} unread`;
    return "Read";
  };

  if (selectedConversation) {
    return (
      <ConversationView
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("instructor.messages.studentMessages")}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {conversations?.length || 0}{" "}
              {t("instructor.messages.conversations")}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={
                t("instructor.messages.searchMessages") || "Search messages..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t("instructor.messages.allStatuses")}</option>
            <option value="unread">{t("instructor.messages.unread")}</option>
            <option value="resolved">
              {t("instructor.messages.resolved")}
            </option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : !conversations?.length ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("instructor.messages.noMessages")}
            </h3>
            <p className="text-gray-600">
              {t("instructor.messages.messagesAppear")}
            </p>
          </div>
        ) : !filteredConversations?.length ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No conversations found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  conversation.unreadCount && conversation.unreadCount > 0
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {conversation.student?.avatar ? (
                        <img
                          src={conversation.student.avatar}
                          alt={conversation.student.fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-medium text-sm">
                          {getInitials(conversation.student?.fullName || "")}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <h3 className="font-medium text-gray-900">
                            {conversation.student?.fullName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Book className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {conversation.course.title}
                          </p>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-1">
                      {conversation.subject}
                    </h4>

                    <div className="text-gray-600 text-sm mb-2 line-clamp-2">
                      <HTMLRenderer content={conversation.content} />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(conversation)}
                        <span>{getStatusText(conversation)}</span>
                      </div>
                      <span>
                        {new Date(
                          conversation.lastActivity || conversation.createdAt
                        ).toLocaleDateString()}
                      </span>
                      {conversation.replyCount > 0 && (
                        <span>{conversation.replyCount} replies</span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorStudentConversations;
