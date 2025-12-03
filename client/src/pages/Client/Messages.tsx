import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaComments,
  FaSearch,
  FaPaperPlane,
  FaGraduationCap,
  FaUsers,
  FaBook,
  FaAngleLeft,
  FaUserCircle,
  FaRegSmile,
} from "react-icons/fa";
import EmojiAndStickerPicker from "../../components/Common/EmojiPicker";
import { useAuthContext } from "../../context/AuthContext";
import { useUserEnrollments } from "../../hooks/useEnrollment";
import { useSocket } from "../../hooks/useSocket";
import {
  useCourseMessages,
  useSendCourseMessage,
  useMarkMessagesAsRead,
  useUnreadMessageCounts,
} from "../../hooks/useCourseMessages";
import { useQueryClient } from "@tanstack/react-query";
import type { CourseMessage as ICourseMessage } from "../../services/courseMessage.service";

interface Course {
  _id: string;
  title: string;
  thumbnail?: string;
  studentsCount?: number;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const Messages: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileCourses, setShowMobileCourses] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userColors, setUserColors] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const { socket, joinCourseRoom, leaveCourseRoom } = useSocket();

  const { data: enrollmentsResponse } = useUserEnrollments();
  const enrollments = enrollmentsResponse?.data?.enrollments || [];

  const { data: messagesResponse, refetch } = useCourseMessages(
    selectedCourse?._id || "",
    1,
    50
  );
  const sendMessageMutation = useSendCourseMessage();
  const markAsReadMutation = useMarkMessagesAsRead();
  const { data: unreadCounts, refetch: refetchUnreadCounts } =
    useUnreadMessageCounts();

  const enrolledCourses: Course[] = enrollments.map((enrollment: any) => ({
    _id: enrollment.course.id,
    title: enrollment.course.title,
    thumbnail: enrollment.course.image.url,
    studentsCount: enrollment.course.studentsEnrolled.length || 0,
    instructor: enrollment.course.instructor,
  }));

  const filteredCourses = enrolledCourses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const handleCourseSelect = (course: Course) => {
    if (selectedCourse) {
      leaveCourseRoom(selectedCourse._id);
    }

    setSelectedCourse(course);

    joinCourseRoom(course._id);

    markAsReadMutation.mutate(course._id, {
      onSuccess: () => {
        refetchUnreadCounts();
      },
      onError: (error) => {
        console.error("❌ Failed to mark messages as read:", error);
      },
    });

    if (isMobileView) {
      setShowMobileCourses(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesResponse]);

  useEffect(() => {
    if (!selectedCourse) return;

    const handleNewCourseMessage = (data: {
      message: ICourseMessage;
      course: string;
    }) => {
      if (data.course === selectedCourse._id) {
        refetch();

        markAsReadMutation.mutate(selectedCourse._id, {
          onSuccess: () => {
            refetchUnreadCounts();
          },
        });
      } else {
        refetchUnreadCounts();
      }
    };

    const handleCourseMessageEdited = (data: {
      message: ICourseMessage;
      courseId: string;
    }) => {
      if (data.courseId === selectedCourse._id) {
        refetch();
      }
    };

    const handleCourseMessageDeleted = (data: {
      messageId: string;
      courseId: string;
    }) => {
      if (data.courseId === selectedCourse._id) {
        refetch();
      }
    };

    if (socket) {
      socket.on("newCourseMessage", handleNewCourseMessage);
      socket.on("courseMessageEdited", handleCourseMessageEdited);
      socket.on("courseMessageDeleted", handleCourseMessageDeleted);

      return () => {
        socket.off("newCourseMessage", handleNewCourseMessage);
        socket.off("courseMessageEdited", handleCourseMessageEdited);
        socket.off("courseMessageDeleted", handleCourseMessageDeleted);
      };
    }
  }, [selectedCourse, queryClient, socket, refetch]);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedCourse) return;

    const messageContent = messageInput.trim();
    const tempMessage: ICourseMessage = {
      _id: `temp-${Date.now()}`,
      content: messageContent,
      sender: {
        _id: user!.id,
        firstName: user!.firstName,
        lastName: user!.lastName,
        avatar: user!.avatar,
      },
      course: selectedCourse._id,
      messageType: "text",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      isRead: false,
      readBy: [],
    };

    queryClient.setQueryData(
      ["courseMessages", selectedCourse._id],
      (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: [...oldData.data.messages, tempMessage],
          },
        };
      }
    );

    // Clear input immediately
    setMessageInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }

    // Send actual message (don't wait for response for UI update)
    sendMessageMutation.mutate(
      {
        content: messageContent,
        course: selectedCourse._id,
        messageType: "text",
      },
      {
        onSuccess: (response) => {
          // Replace optimistic message with real one
          queryClient.setQueryData(
            ["courseMessages", selectedCourse._id],
            (oldData: any) => {
              if (!oldData) return oldData;
              const messages = oldData.data.messages.map(
                (msg: ICourseMessage) =>
                  msg._id === tempMessage._id ? response.data : msg
              );
              return {
                ...oldData,
                data: { ...oldData.data, messages },
              };
            }
          );
        },
        onError: (error) => {
          console.error("Failed to send message:", error);
          // Show error message to user
          alert(t("messages.sendError"));
          // Revert optimistic update on error
          queryClient.setQueryData(
            ["courseMessages", selectedCourse._id],
            (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  messages: oldData.data.messages.filter(
                    (msg: ICourseMessage) => msg._id !== tempMessage._id
                  ),
                },
              };
            }
          );
        },
      }
    );
  }, [
    messageInput,
    selectedCourse,
    sendMessageMutation,
    user,
    queryClient,
    refetch,
  ]);

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

  const handleBack = () => {
    if (isMobileView) {
      setSelectedCourse(null);
      setShowMobileCourses(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleStickerSelect = (sticker: string) => {
    if (!selectedCourse || !user) return;

    const tempMessage: ICourseMessage = {
      _id: `temp-sticker-${Date.now()}`,
      content: sticker,
      sender: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      course: selectedCourse._id,
      messageType: "image",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      isRead: false,
      readBy: [],
    };

    // Optimistic update - add sticker to UI immediately
    queryClient.setQueryData(
      ["courseMessages", selectedCourse._id],
      (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: [...oldData.data.messages, tempMessage],
          },
        };
      }
    );

    // Send actual sticker (don't wait for response for UI update)
    sendMessageMutation.mutate(
      {
        content: sticker,
        course: selectedCourse._id,
        messageType: "image",
      },
      {
        onSuccess: (response) => {
          // Replace optimistic message with real one
          queryClient.setQueryData(
            ["courseMessages", selectedCourse._id],
            (oldData: any) => {
              if (!oldData) return oldData;
              const messages = oldData.data.messages.map(
                (msg: ICourseMessage) =>
                  msg._id === tempMessage._id ? response.data : msg
              );
              return {
                ...oldData,
                data: { ...oldData.data, messages },
              };
            }
          );
        },
        onError: (error) => {
          console.error("Failed to send sticker:", error);
          // Show error message to user
          alert(t("messages.stickerError"));
          // Revert optimistic update on error
          queryClient.setQueryData(
            ["courseMessages", selectedCourse._id],
            (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  messages: oldData.data.messages.filter(
                    (msg: ICourseMessage) => msg._id !== tempMessage._id
                  ),
                },
              };
            }
          );
        },
      }
    );

    setShowEmojiPicker(false);
  };

  const currentMessages = messagesResponse?.data?.messages || [];

  if (enrolledCourses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaGraduationCap className="text-3xl text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t("messages.noEnrolledCourses")}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {t("messages.needToEnrollMessage")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaComments className="mr-3 text-blue-600" />
              {t("messages.courseDiscussions")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("messages.connectWithStudents")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Courses Sidebar */}
          <div
            className={`lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${
              isMobileView && !showMobileCourses ? "hidden" : ""
            }`}
          >
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("messages.searchCourses")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Courses List */}
            <div className="flex-1 overflow-y-auto">
              {filteredCourses.length === 0 ? (
                <div className="p-6 text-center">
                  <FaBook className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {t("messages.noCoursesFound")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredCourses.map((course) => {
                    const isSelected = selectedCourse?._id === course._id;
                    const unreadCount = unreadCounts?.data?.[course._id] || 0;

                    return (
                      <motion.div
                        key={course._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCourseSelect(course)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 shadow-md"
                            : "bg-gray-50 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaBook className="text-blue-600" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium truncate ${
                                isSelected ? "text-blue-700" : "text-gray-800"
                              }`}
                            >
                              {course.title}
                            </h3>
                            <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                              <div className="flex items-center">
                                <FaUsers className="mr-1" />
                                <span>
                                  {course.studentsCount || 0}{" "}
                                  {course.studentsCount === 1
                                    ? t("messages.student")
                                    : t("messages.students")}
                                </span>
                              </div>
                              {unreadCount > 0 && (
                                <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col ${
              isMobileView && showMobileCourses ? "hidden" : ""
            }`}
          >
            {selectedCourse ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {isMobileView && (
                        <button
                          onClick={handleBack}
                          className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
                        >
                          <FaAngleLeft className="text-gray-600" />
                        </button>
                      )}

                      <div className="flex items-center space-x-3">
                        {selectedCourse.thumbnail ? (
                          <img
                            src={selectedCourse.thumbnail}
                            alt={selectedCourse.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaBook className="text-blue-600" />
                          </div>
                        )}

                        <div>
                          <h2 className="text-xl font-bold text-gray-800">
                            {selectedCourse.title}
                          </h2>
                          <p className="text-gray-600 flex items-center">
                            <FaUsers className="mr-1" />
                            {t("messages.groupChat")} •{" "}
                            {selectedCourse.studentsCount || 0}{" "}
                            {selectedCourse.studentsCount === 1
                              ? t("messages.student")
                              : t("messages.students")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <AnimatePresence>
                    {currentMessages.length === 0 ? (
                      <div className="text-center py-16">
                        <FaComments className="mx-auto text-4xl text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">
                          {t("messages.noMessagesYet")}
                        </p>
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
                                    {message.sender.firstName}{" "}
                                    {message.sender.lastName}
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

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-4 relative">
                    <div className="flex-1">
                      <textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={handleTextareaResize}
                        onKeyDown={handleKeyDown}
                        placeholder={t("messages.typeMessage")}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none min-h-[48px] max-h-[120px] overflow-hidden"
                        rows={1}
                        style={{ overflow: "hidden" }}
                      />
                    </div>

                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 flex-shrink-0"
                    >
                      <FaRegSmile />
                    </button>

                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 hover:scale-105 flex-shrink-0 cursor-pointer"
                    >
                      <FaPaperPlane />
                    </button>

                    <EmojiAndStickerPicker
                      isOpen={showEmojiPicker}
                      onClose={() => setShowEmojiPicker(false)}
                      onEmojiSelect={handleEmojiSelect}
                      onStickerSelect={handleStickerSelect}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FaComments className="mx-auto text-6xl text-gray-300 mb-6" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">
                    {t("messages.selectCourse")}
                  </h3>
                  <p className="text-gray-400">
                    {t("messages.chooseCourseMessage")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
