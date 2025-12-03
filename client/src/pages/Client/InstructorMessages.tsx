import React, { useState } from "react";
import {
  Search,
  MessageCircle,
  ChevronRight,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  useEnrolledInstructors,
  useStudentConversations,
} from "../../hooks/useStudentInstructorMessages";
import type { ConversationSummary } from "../../services/studentInstructorMessage.service";
import ConversationView from "../../components/Client/ConversationView";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import NewMessageModal from "../../components/Client/NewMessageModal";
import HTMLRenderer from "../../utils/htmlRenderer";

const InstructorMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: instructors } = useEnrolledInstructors();
  const { data: conversations, isLoading: conversationsLoading } =
    useStudentConversations();

  const filteredConversations = conversations?.filter(
    (conversation) =>
      conversation.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.instructor?.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conversation.instructor?.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conversation.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (conversation: ConversationSummary) => {
    if (conversation.status === "resolved") {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Clock className="h-4 w-4 text-orange-500" />;
  };

  const getStatusText = (conversation: ConversationSummary) => {
    switch (conversation.status) {
      case "resolved":
        return "Resolved";
      case "read":
        return "Read";
      default:
        return "Sent";
    }
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">
                Communicate with your instructors for course support
              </p>
            </div>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
              disabled={!instructors?.length}
            >
              <MessageCircle className="h-4 w-4" />
              New Message
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {conversationsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : !conversations?.length ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start a conversation with your instructors to get help with your
                courses
              </p>
              {instructors?.length ? (
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Your First Message
                </button>
              ) : (
                <p className="text-gray-500">
                  Enroll in courses to message their instructors
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations?.map((conversation) => {
                return (
                  <div
                    key={conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={conversation.course?.image.url}
                            alt={conversation.instructor?.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {conversation.instructor?.fullName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {conversation.course.title}
                            </p>
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
                              conversation.createdAt
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <NewMessageModal
          instructors={instructors || []}
          onClose={() => setShowNewMessageModal(false)}
          onSuccess={() => setShowNewMessageModal(false)}
        />
      )}
    </div>
  );
};

export default InstructorMessages;
