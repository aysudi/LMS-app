import { useCallback, useRef, useState } from "react";
import EmojiAndStickerPicker from "../../Common/EmojiPicker";
import { FaPaperPlane, FaRegSmile } from "react-icons/fa";
import type { CourseMessage as ICourseMessage } from "../../../services/courseMessage.service";
import { t } from "i18next";
import { useSendCourseMessage } from "../../../hooks/useCourseMessages";

type Props = {
  selectedCourse: any;
  user: any;
  queryClient: any;
  refetch: () => void;
};

const MessagesInput = ({
  selectedCourse,
  user,
  queryClient,
  refetch,
}: Props) => {
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessageMutation = useSendCourseMessage();

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

    setMessageInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }

    sendMessageMutation.mutate(
      {
        content: messageContent,
        course: selectedCourse._id,
        messageType: "text",
      },
      {
        onSuccess: (response) => {
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
          alert(t("messages.sendError"));
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

    sendMessageMutation.mutate(
      {
        content: sticker,
        course: selectedCourse._id,
        messageType: "image",
      },
      {
        onSuccess: (response) => {
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
          alert(t("messages.stickerError"));
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

  return (
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
  );
};

export default MessagesInput;
