import { motion, AnimatePresence } from "framer-motion";
import {
  FaComments,
  FaSearch,
  FaPaperPlane,
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaUser,
  FaGraduationCap,
  FaPlus,
  FaSpinner,
  FaTrash,
  FaArchive,
  FaSmile,
  FaPaperclip,
  FaAngleLeft,
  FaBell,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import {
  useConversations,
  useMessages,
  useMessageMutations,
  useConversationMutations,
} from "../../hooks/useMessages";
import { useUserEnrollments } from "../../hooks/useEnrollment";
import { useSocket } from "../../hooks/useSocket";
import Loading from "../../components/Common/Loading";
import NoConversationsState from "../../components/Common/NoConversationsState";
import EmojiAndStickerPicker from "../../components/Common/EmojiPicker";
import { format, isToday, isYesterday } from "date-fns";
import type { Message, CreateMessageData } from "../../types/message.type";
import React, { useCallback, useEffect, useRef, useState } from "react";

const Messages: React.FC = () => {
  const { user } = useAuthContext();
  const { joinConversation, leaveConversation, getTypingUsers, isUserOnline } =
    useSocket();

  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState<
    string | null
  >(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce search term to prevent constant API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch conversations and messages with stable dependencies
  const {
    data: conversationsData,
    isLoading: loadingConversations,
    refetch: refetchConversations,
  } = useConversations(
    {
      search: debouncedSearchTerm || undefined, // Only pass search if it has value
    },
    {
      enabled: !!user?.id,
      staleTime: 10 * 60 * 1000, // 10 minutes - longer stale time
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Prevent refetch on component mount
      refetchInterval: false, // Disable interval refetching
    }
  );

  const selectedConversationId = selectedConversation?._id || "";
  const { data: messagesData, isLoading: loadingMessages } = useMessages(
    {
      conversationId: selectedConversationId,
    },
    {
      enabled: !!selectedConversationId,
      staleTime: 30 * 1000, // 30 seconds - messages can be a bit stale for performance
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
    }
  );

  const { data: enrollments } = useUserEnrollments();
  const { sendMessage } = useMessageMutations();
  const { markAsRead, deleteConversation } = useConversationMutations();

  const conversations = conversationsData?.data?.conversations || [];
  const messages = messagesData?.data?.data?.messages || [];

  // Socket.IO conversation management (prevent infinite loops)
  useEffect(() => {
    if (conversations.length > 0) {
      const conversationIds = conversations.map((conv: any) => conv._id);
      joinConversation(conversationIds.join(","));
    }
  }, [conversations.length, joinConversation]);

  useEffect(() => {
    if (selectedConversationId) {
      joinConversation(selectedConversationId);

      return () => {
        leaveConversation(selectedConversationId);
      };
    }
  }, [selectedConversationId, joinConversation, leaveConversation]);

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.unreadCount > 0) {
      markAsRead.mutate(selectedConversation._id);
    }
  }, [selectedConversation?._id, markAsRead]);

  // Auto-resize textarea with throttling - use ref to avoid re-renders
  const autoResizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedConversation || sendMessage.isPending)
      return;

    const otherParticipant =
      selectedConversation.participants.student._id === user?.id
        ? selectedConversation.participants.instructor
        : selectedConversation.participants.student;

    const messageData: CreateMessageData = {
      receiverId: otherParticipant._id,
      courseId: selectedConversation.courseId._id,
      content: messageInput.trim(),
    };

    sendMessage.mutate(messageData, {
      onSuccess: () => {
        setMessageInput("");
        setIsTyping(false);
        // Reset textarea height after clearing message
        setTimeout(() => autoResizeTextarea(), 0);
      },
    });
  }, [messageInput, selectedConversation, user?.id, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setMessageInput(newValue);

      // Direct auto-resize without refs to avoid re-renders
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;

      // Simple typing indicator with direct state updates
      if (newValue.trim()) {
        setIsTyping(true);
        // Use a simple timeout without refs to avoid dependency issues
        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      } else {
        setIsTyping(false);
      }
    },
    [] // EMPTY dependency array to prevent re-renders!
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
    },
    []
  );

  const getOtherParticipant = useCallback(
    (conversation: any) => {
      return conversation.participants.student._id === user?.id
        ? conversation.participants.instructor
        : conversation.participants.student;
    },
    [user?.id]
  );

  const isMessageFromMe = useCallback(
    (message: Message) => {
      const senderId =
        typeof message.senderId === "string"
          ? message.senderId
          : message.senderId?._id;
      return String(senderId) === String(user?.id || "");
    },
    [user?.id]
  );

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setMessageInput((prev) => prev + emoji);
      setShowEmojiPicker(false);
      // Auto-resize after emoji addition
      setTimeout(() => autoResizeTextarea(), 0);
    },
    [autoResizeTextarea]
  );

  const handleStickerSelect = useCallback(
    (sticker: string) => {
      // For stickers, we'll send them as special message type
      if (selectedConversation && sendMessage) {
        const otherParticipant =
          selectedConversation.participants.student._id === user?.id
            ? selectedConversation.participants.instructor
            : selectedConversation.participants.student;

        const messageData = {
          receiverId: otherParticipant._id,
          courseId: selectedConversation.courseId._id,
          content: sticker,
          messageType: "image" as const,
        };

        sendMessage.mutate(messageData);
      }
      setShowEmojiPicker(false);
    },
    [selectedConversation, user?.id, sendMessage]
  );

  const formatMessageTime = useCallback((date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, "HH:mm");
    } else if (isYesterday(messageDate)) {
      return "Yesterday";
    } else {
      return format(messageDate, "MMM dd");
    }
  }, []);

  const handleConversationSelect = useCallback(
    (conversation: any) => {
      setSelectedConversation(conversation);
      setShowConversationMenu(null);
      if (isMobileView) {
        setShowMobileConversations(false);
      }
    },
    [isMobileView]
  );

  const handleBackToConversations = useCallback(() => {
    setShowMobileConversations(true);
    setSelectedConversation(null);
  }, []);

  const handleNewMessage = useCallback(
    (_: string, instructorId: string, courseId: string) => {
      const messageData: CreateMessageData = {
        receiverId: instructorId,
        courseId: courseId,
        content: "Hello! I have a question about this course.",
      };

      sendMessage.mutate(messageData, {
        onSuccess: () => {
          setShowNewMessageModal(false);
          refetchConversations();
        },
        onError: (error) => {
          console.error("Failed to create conversation:", error);
        },
      });
    },
    [sendMessage, refetchConversations]
  );

  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      if (
        window.confirm("Are you sure you want to delete this conversation?")
      ) {
        deleteConversation.mutate(conversationId, {
          onSuccess: () => {
            if (selectedConversation?._id === conversationId) {
              setSelectedConversation(null);
              if (isMobileView) {
                setShowMobileConversations(true);
              }
            }
          },
        });
      }
      setShowConversationMenu(null);
    },
    [deleteConversation, selectedConversation?._id, isMobileView]
  );

  const ConversationsList = React.memo(() => (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaComments className="text-blue-600" />
            Messages
          </h1>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
            title="Start new conversation"
          >
            <FaPlus />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            autoComplete="off"
          />
          {/* Search loading indicator */}
          {searchTerm !== debouncedSearchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaSpinner className="text-gray-400 text-sm animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loadingConversations ? (
          <div className="flex items-center justify-center h-32">
            <Loading variant="default" size="sm" />
          </div>
        ) : conversations.length === 0 ? (
          <NoConversationsState
            onStartConversation={() => setShowNewMessageModal(true)}
            hasEnrollments={!!enrollments?.enrollments?.length}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = selectedConversation?._id === conversation._id;

              return (
                <motion.div
                  key={conversation._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    isSelected ? "bg-blue-50 border-r-4 border-blue-600" : ""
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                        {otherParticipant.profilePicture ? (
                          <img
                            src={otherParticipant.profilePicture}
                            alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-lg" />
                        )}
                      </div>
                      {/* Online indicator - use Socket.IO data */}
                      {isUserOnline(otherParticipant._id) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name and time */}
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherParticipant.firstName}{" "}
                          {otherParticipant.lastName}
                        </h3>
                        <div className="flex items-center gap-2">
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(
                                conversation.lastMessage.createdAt
                              )}
                            </span>
                          )}
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last Message */}
                      {conversation.lastMessage && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600 truncate flex-1">
                            {conversation.lastMessage.senderId === user?.id && (
                              <span className="text-gray-500">You: </span>
                            )}
                            {conversation.lastMessage.content.startsWith("http")
                              ? "🎨 Sticker"
                              : conversation.lastMessage.content}
                          </p>
                          {conversation.lastMessage.senderId === user?.id && (
                            <div className="flex-shrink-0">
                              {conversation.lastMessage.isRead ? (
                                <FaCheckDouble className="text-xs text-blue-500" />
                              ) : (
                                <FaCheck className="text-xs text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Menu button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConversationMenu(
                            showConversationMenu === conversation._id
                              ? null
                              : conversation._id
                          );
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <FaEllipsisV className="text-gray-500 text-sm" />
                      </button>

                      {/* Dropdown menu */}
                      <AnimatePresence>
                        {showConversationMenu === conversation._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[160px]"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Archive functionality here
                                setShowConversationMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <FaArchive className="text-xs" />
                              Archive
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation._id);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <FaTrash className="text-xs" />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  ));

  const ChatArea = () => (
    <div className="flex-1 flex flex-col bg-white">
      {selectedConversation ? (
        <>
          {/* Chat Header */}
          <div className="p-4 lg:p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button
                    onClick={handleBackToConversations}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-2"
                  >
                    <FaAngleLeft className="text-gray-600" />
                  </button>
                )}

                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                    {getOtherParticipant(selectedConversation)
                      .profilePicture ? (
                      <img
                        src={
                          getOtherParticipant(selectedConversation)
                            .profilePicture
                        }
                        alt={`${
                          getOtherParticipant(selectedConversation).firstName
                        } ${
                          getOtherParticipant(selectedConversation).lastName
                        }`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  {/* Online indicator with Socket.IO data */}
                  {isUserOnline(
                    getOtherParticipant(selectedConversation)._id
                  ) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    {getOtherParticipant(selectedConversation).firstName}{" "}
                    {getOtherParticipant(selectedConversation).lastName}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FaGraduationCap className="text-xs" />
                    <span className="truncate">
                      {selectedConversation.courseId.title}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <FaBell className="text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <FaEllipsisV className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gray-50">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-32">
                <Loading variant="default" size="sm" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <FaComments className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-600">
                  Start the conversation by sending a message below
                </p>
              </div>
            ) : (
              <>
                {messages.map((message: any, index: number) => {
                  const fromMe = isMessageFromMe(message);
                  const showDateSeparator =
                    index === 0 ||
                    (!isToday(new Date(message.createdAt)) &&
                      isToday(new Date(messages[index - 1]?.createdAt)));

                  return (
                    <React.Fragment key={message._id}>
                      {showDateSeparator && (
                        <div className="text-center my-4">
                          <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                            {format(
                              new Date(message.createdAt),
                              "MMMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          fromMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            fromMe
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                          }`}
                        >
                          {message.messageType === "image" &&
                          message.content.startsWith("http") ? (
                            <img
                              src={message.content}
                              alt="Sticker"
                              className="w-24 h-24 object-contain rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                // Show text fallback
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement("p");
                                  fallback.className =
                                    "text-sm leading-relaxed whitespace-pre-wrap";
                                  fallback.textContent = message.content;
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}
                          <div
                            className={`flex items-center gap-1 mt-2 justify-end ${
                              fromMe ? "text-blue-200" : "text-gray-500"
                            }`}
                          >
                            <span className="text-xs">
                              {format(new Date(message.createdAt), "HH:mm")}
                            </span>
                            {fromMe && (
                              <div className="ml-1">
                                {message.isRead ? (
                                  <FaCheckDouble className="text-xs" />
                                ) : (
                                  <FaCheck className="text-xs" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })}

                {/* Real-time typing indicator from Socket.IO */}
                {selectedConversation &&
                  getTypingUsers(selectedConversation._id).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span>
                            {
                              getTypingUsers(selectedConversation._id)[0]
                                ?.username
                            }{" "}
                            is typing...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                {/* Local typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 lg:p-6 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 max-h-32 bg-white"
                  style={{ minHeight: "48px" }}
                  autoComplete="off"
                  disabled={false}
                  readOnly={false}
                />

                {/* Emoji button */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    title="Add emoji"
                  >
                    <FaSmile className="text-gray-500" />
                  </button>
                  <EmojiAndStickerPicker
                    isOpen={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    onEmojiSelect={handleEmojiSelect}
                    onStickerSelect={handleStickerSelect}
                  />
                </div>
              </div>

              {/* File attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                title="Attach file"
              >
                <FaPaperclip className="text-gray-500" />
              </button>

              {/* Send button */}
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendMessage.isPending}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                title="Send message"
              >
                {sendMessage.isPending ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
            onChange={(e) => {
              // Handle file upload
              const file = e.target.files?.[0];
              if (file) {
                console.log("File selected:", file.name);
                // Implement file upload logic here
              }
            }}
          />
        </>
      ) : (
        /* No Conversation Selected */
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaComments className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to Messages
            </h3>
            <p className="text-gray-600 mb-6">
              Select a conversation from the sidebar to start messaging, or
              create a new conversation with your instructors.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[91vh] bg-gray-50 flex">
      {/* Desktop: Always show both panels */}
      {!isMobileView && (
        <>
          <div className="w-1/3 max-w-sm">
            <ConversationsList />
          </div>
          <ChatArea />
        </>
      )}

      {/* Mobile: Show one panel at a time */}
      {isMobileView && (
        <>
          {showMobileConversations ? (
            <div className="w-full">
              <ConversationsList />
            </div>
          ) : (
            <div className="w-full">
              <ChatArea />
            </div>
          )}
        </>
      )}

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Start New Conversation
                </h2>
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  You can message instructors of courses you're enrolled in.
                </p>

                {!enrollments?.enrollments?.length ? (
                  <div className="text-center py-8">
                    <FaGraduationCap className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No courses found
                    </h3>
                    <p className="text-gray-600">
                      You need to be enrolled in a course to message instructors
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollments.enrollments.map((enrollment: any) => (
                      <motion.div
                        key={enrollment._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:border-blue-300 hover:shadow-md"
                        onClick={() =>
                          handleNewMessage(
                            enrollment._id,
                            enrollment.course.instructor._id,
                            enrollment.course._id
                          )
                        }
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {enrollment.course.thumbnail ? (
                              <img
                                src={enrollment.course.thumbnail}
                                alt={enrollment.course.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <FaGraduationCap />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {enrollment.course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Instructor:{" "}
                              {enrollment.course.instructor.firstName}{" "}
                              {enrollment.course.instructor.lastName}
                            </p>
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Active enrollment
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messages;
