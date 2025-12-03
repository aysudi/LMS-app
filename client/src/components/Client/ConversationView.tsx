import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, User } from "lucide-react";
import {
  useConversationThread,
  useReplyToMessage,
  useMarkMessageAsRead,
  useMarkConversationAsResolved,
} from "../../hooks/useStudentInstructorMessages";
import { useAuthContext } from "../../context/AuthContext";
import RichTextEditor from "../UI/RichTextEditor";
import LoadingSpinner from "../UI/LoadingSpinner";
import type { ConversationSummary } from "../../services/studentInstructorMessage.service";
import type { IStudentInstructorMessage } from "../../types/studentInstructorMessage.type";
import HTMLRenderer from "../../utils/htmlRenderer";

interface ConversationViewProps {
  conversation: ConversationSummary;
  onBack: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onBack,
}) => {
  const { user } = useAuthContext();
  const [replyContent, setReplyContent] = useState("");

  const { data: thread, isLoading } = useConversationThread(conversation._id);
  //   console.log("thread: ", thread);
  const replyMutation = useReplyToMessage();
  const markAsReadMutation = useMarkMessageAsRead();
  const markAsResolvedMutation = useMarkConversationAsResolved();

  const isInstructor = user?.role === "instructor";
  const isCourseInstructor = thread?.rootMessage.instructor._id === user?.id;

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.map((n) => n.charAt(0).toUpperCase()).join("");
  };
  console.log("is instructor : ", isInstructor);

  // Mark unread messages as read when viewing
  useEffect(() => {
    if (thread && !isInstructor) {
      const unreadReplies = thread.replies.filter(
        (reply) => !reply.isStudentMessage && !reply.readAt
      );

      unreadReplies.forEach((reply) => {
        markAsReadMutation.mutate(reply._id);
      });
    }
  }, [thread, isInstructor, markAsReadMutation]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim()) return;

    try {
      await replyMutation.mutateAsync({
        messageId: conversation._id,
        data: { content: replyContent.trim() },
      });
      setReplyContent("");
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleMarkAsResolved = () => {
    markAsResolvedMutation.mutate(conversation._id);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  const renderMessage = (
    message: IStudentInstructorMessage,
    isRoot = false
  ) => {
    const isOwnMessage = message.isStudentMessage
      ? user?.id === message.student._id
      : user?.id === message.instructor._id;

    // console.log("message :", message);
    const sender = message.isStudentMessage
      ? message.student
      : message.instructor;

    // console.log("sender: ", sender);

    return (
      <div
        key={message._id}
        className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""} ${
          isRoot ? "mb-6" : "mb-4"
        }`}
      >
        {sender.avatar ? (
          <img
            src={sender.avatar}
            alt={sender.fullName}
            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {getInitials(sender.fullName)}
          </div>
        )}

        <div className={`flex-1 max-w-3xl ${isOwnMessage ? "text-right" : ""}`}>
          <div
            className={`inline-block p-4 rounded-lg ${
              isOwnMessage
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {isRoot && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{sender.fullName}</span>
                  {message.isStudentMessage && (
                    <span className="text-xs opacity-75">(Student)</span>
                  )}
                  {!message.isStudentMessage && (
                    <span className="text-xs opacity-75">(Instructor)</span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {message.subject}
                </h3>
                <div className="text-sm opacity-75 mb-3">
                  Course: {message.course.title}
                </div>
              </div>
            )}

            <HTMLRenderer content={message.content} />
          </div>

          <div
            className={`text-xs text-gray-500 mt-2 ${
              isOwnMessage ? "text-right" : "text-left"
            }`}
          >
            <div className="flex items-center gap-2 justify-end">
              {message.status === "resolved" && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Resolved</span>
                </div>
              )}
              {message.readAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span>Read</span>
                </div>
              )}
              <span>{formatDate(message.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Conversation not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Go back
        </button>
      </div>
    );
  }

  const isResolved = conversation.status === "resolved";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {thread.rootMessage.subject}
                </h1>
                <p className="text-gray-600 text-sm">
                  {thread.rootMessage.course.title}
                </p>
              </div>
            </div>

            {isCourseInstructor && !isResolved && (
              <button
                onClick={handleMarkAsResolved}
                disabled={markAsResolvedMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Resolved
              </button>
            )}

            {isResolved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Resolved</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="p-6">
          {/* Root message */}
          {renderMessage(thread.rootMessage, true)}

          {/* Replies */}
          <div className="space-y-4">
            {thread.replies.map((reply) => renderMessage(reply))}
          </div>
        </div>

        {/* Reply form */}
        {!isResolved && (
          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleReply}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reply
                </label>
                <RichTextEditor
                  content={replyContent}
                  onChange={setReplyContent}
                  placeholder="Write your reply..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!replyContent.trim() || replyMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {replyMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationView;
