import React, { useState } from "react";
import { motion } from "framer-motion";
import type {
  Announcement,
  CreateAnnouncementData,
  UpdateAnnouncementData,
} from "../../../types/announcement.type";
import { useToast } from "../../UI/ToastProvider";
import { generalToasts } from "../../../utils/toastUtils";
import RichTextEditor from "../../UI/RichTextEditor";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    announcement: CreateAnnouncementData | UpdateAnnouncementData
  ) => void;
  announcement?: Announcement;
  courseId: string;
}

const AnnouncementModal = ({
  isOpen,
  onClose,
  onSave,
  announcement,
  courseId,
}: AnnouncementModalProps) => {
  const [title, setTitle] = useState(announcement?.title || "");
  const [content, setContent] = useState(announcement?.content || "");
  const [priority, setPriority] = useState(announcement?.priority || "medium");
  const [targetAudience, setTargetAudience] = useState(
    announcement?.targetAudience || "enrolled"
  );
  const [isPublished, _] = useState(announcement?.isPublished ?? true);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showToast(generalToasts.error("Error", "Title and content are required"));
      return;
    }

    const announcementData = {
      title: title.trim(),
      content: content.trim(),
      priority: priority as "low" | "medium" | "high" | "urgent",
      targetAudience: targetAudience as "all" | "enrolled" | "completed",
      isPublished,
      course: courseId,
    };

    onSave(announcementData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {announcement ? "Edit Announcement" : "Create Announcement"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Announcement title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value as "low" | "medium" | "high" | "urgent"
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) =>
                    setTargetAudience(
                      e.target.value as "all" | "enrolled" | "completed"
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Students</option>
                  <option value="enrolled">Enrolled Students</option>
                  <option value="completed">Completed Students</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your announcement content..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 cursor-pointer"
              >
                {announcement ? "Update" : "Create"} Announcement
              </button>
              {/* </div> */}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
