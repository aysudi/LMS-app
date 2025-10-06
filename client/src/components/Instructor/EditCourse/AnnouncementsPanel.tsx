import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaBullhorn,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaUsers,
  FaExclamationTriangle,
  FaInfo,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import type { Course } from "../../../types/course.type";
import RichTextEditor from "../../UI/RichTextEditor";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "all" | "enrolled" | "completed";
  isPublished: boolean;
  publishedAt: Date;
  readBy: string[];
}

interface AnnouncementsPanelProps {
  course: Course;
  onUpdate: (changes: Partial<Course>) => void;
}

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (announcement: Omit<Announcement, "id" | "publishedAt" | "readBy">) => void;
  announcement?: Announcement;
}

const priorityConfig = {
  low: { color: "text-gray-600", bg: "bg-gray-100", icon: FaInfo },
  medium: { color: "text-blue-600", bg: "bg-blue-100", icon: FaInfo },
  high: { color: "text-orange-600", bg: "bg-orange-100", icon: FaExclamationTriangle },
  urgent: { color: "text-red-600", bg: "bg-red-100", icon: FaExclamationTriangle },
};

const AnnouncementModal = ({ isOpen, onClose, onSave, announcement }: AnnouncementModalProps) => {
  const [title, setTitle] = useState(announcement?.title || "");
  const [content, setContent] = useState(announcement?.content || "");
  const [priority, setPriority] = useState(announcement?.priority || "medium");
  const [targetAudience, setTargetAudience] = useState(announcement?.targetAudience || "enrolled");
  const [isPublished, setIsPublished] = useState(announcement?.isPublished ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      priority: priority as any,
      targetAudience: targetAudience as any,
      isPublished,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
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
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100"
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
                  onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
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
                  onChange={(e) => setTargetAudience(e.target.value as "all" | "enrolled" | "completed")}
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
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="publish"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="publish" className="text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  {announcement ? "Update" : "Create"} Announcement
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

const AnnouncementsPanel = ({}: AnnouncementsPanelProps) => {
  // Mock announcements data - in real app, this would come from API
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "Welcome to the Course!",
      content: "<p>Welcome to this amazing course. We're excited to have you here!</p>",
      priority: "medium",
      targetAudience: "enrolled",
      isPublished: true,
      publishedAt: new Date(),
      readBy: [],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | undefined>();

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(undefined);
    setIsModalOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = (announcementData: Omit<Announcement, "id" | "publishedAt" | "readBy">) => {
    if (editingAnnouncement) {
      // Update existing
      setAnnouncements(announcements.map(a => 
        a.id === editingAnnouncement.id 
          ? { ...a, ...announcementData }
          : a
      ));
      toast.success("Announcement updated successfully!");
    } else {
      // Create new
      const newAnnouncement: Announcement = {
        ...announcementData,
        id: Date.now().toString(),
        publishedAt: new Date(),
        readBy: [],
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      toast.success("Announcement created successfully!");
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast.success("Announcement deleted successfully!");
  };

  const toggleAnnouncementStatus = (id: string) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, isPublished: !a.isPublished } : a
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaBullhorn className="mr-2 text-indigo-600" />
            Course Announcements
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Keep your students informed with important updates
          </p>
        </div>
        <button
          onClick={handleCreateAnnouncement}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
        >
          <FaPlus className="mr-2" />
          New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => {
          const PriorityIcon = priorityConfig[announcement.priority].icon;
          
          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[announcement.priority].bg} ${priorityConfig[announcement.priority].color}`}>
                      <PriorityIcon className="mr-1 h-3 w-3" />
                      {announcement.priority}
                    </span>

                    {announcement.isPublished ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1 h-3 w-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Draft
                      </span>
                    )}
                  </div>

                  <div 
                    className="text-gray-600 text-sm mb-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      {announcement.publishedAt.toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      {announcement.targetAudience === "all" ? "All students" : 
                       announcement.targetAudience === "enrolled" ? "Enrolled students" : "Completed students"}
                    </div>
                    {announcement.readBy.length > 0 && (
                      <div>
                        {announcement.readBy.length} read
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleAnnouncementStatus(announcement.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.isPublished
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                    title={announcement.isPublished ? "Published" : "Draft"}
                  >
                    {announcement.isPublished ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  
                  <button
                    onClick={() => handleEditAnnouncement(announcement)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <FaBullhorn className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first announcement to keep students informed about important updates.
            </p>
            <button
              onClick={handleCreateAnnouncement}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <FaPlus className="mr-2" />
              Create First Announcement
            </button>
          </div>
        )}
      </div>

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAnnouncement}
        announcement={editingAnnouncement}
      />
    </div>
  );
};

export default AnnouncementsPanel;
