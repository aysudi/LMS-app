import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaPlus,
  FaBullhorn,
  FaTrash,
  FaClock,
  FaUsers,
  FaExclamationTriangle,
  FaInfo,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import Swal from "sweetalert2";
import type { Course } from "../../../types/course.type";
import type {
  Announcement,
  CreateAnnouncementData,
  UpdateAnnouncementData,
} from "../../../types/announcement.type";
import {
  useInstructorAnnouncements,
  useAnnouncementMutations,
} from "../../../hooks/useAnnouncements";
import { useToast } from "../../UI/ToastProvider";
import { generalToasts } from "../../../utils/toastUtils";
import AnnouncementModal from "./AnnouncementModal";

interface AnnouncementsPanelProps {
  course: Course;
  onUpdate: (changes: Partial<Course>) => void;
  onSave?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

const priorityConfig = {
  low: { color: "text-gray-600", bg: "bg-gray-100", icon: FaInfo },
  medium: { color: "text-blue-600", bg: "bg-blue-100", icon: FaInfo },
  high: {
    color: "text-orange-600",
    bg: "bg-orange-100",
    icon: FaExclamationTriangle,
  },
  urgent: {
    color: "text-red-600",
    bg: "bg-red-100",
    icon: FaExclamationTriangle,
  },
};

const AnnouncementsPanel = ({ course }: AnnouncementsPanelProps) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<
    Announcement | undefined
  >();
  const { showToast } = useToast();

  // Fetch instructor's announcements for this course
  const { announcements, isLoading } = useInstructorAnnouncements({
    course: course.id,
    limit: 20,
  });

  // Get mutation functions
  const { createAnnouncement, updateAnnouncement, deleteAnnouncement } =
    useAnnouncementMutations();

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(undefined);
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = (
    announcementData: CreateAnnouncementData | UpdateAnnouncementData
  ) => {
    if (editingAnnouncement) {
      // Update existing announcement
      updateAnnouncement.mutate({
        id: editingAnnouncement._id,
        data: announcementData as UpdateAnnouncementData,
      });
    } else {
      // Create new announcement
      createAnnouncement.mutate(announcementData as CreateAnnouncementData);
      showToast(generalToasts.success("Success", "Announcement created"));
    }
    setIsModalOpen(false);
  };

  const handleDeleteAnnouncement = (id: string) => {
    console.log("id", id);
    Swal.fire({
      title: "Delete Announcement",
      text: "Are you sure you want to delete this announcement? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg px-6 py-2",
        cancelButton: "rounded-lg px-6 py-2",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAnnouncement.mutate(id);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading announcements...</span>
        </div>
      </div>
    );
  }

  // if (!announcementsData) return null;
  // const announcements = announcementsData?.data || [];

  // console.log("announcements", announcements);

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
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 cursor-pointer"
        >
          <FaPlus className="mr-2" />
          New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement, index) => {
          const PriorityIcon = priorityConfig[announcement.priority].icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {announcement.title}
                    </h3>

                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        priorityConfig[announcement.priority].bg
                      } ${priorityConfig[announcement.priority].color}`}
                    >
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
                      {announcement.publishedAt
                        ? new Date(
                            announcement.publishedAt
                          ).toLocaleDateString()
                        : new Date(announcement.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      {announcement.targetAudience === "all"
                        ? "All students"
                        : announcement.targetAudience === "enrolled"
                        ? "Enrolled students"
                        : "Completed students"}
                    </div>
                    {announcement.readBy.length > 0 && (
                      <div>{announcement.readBy.length} read</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("instructor.editCourse.announcements.noAnnouncements")}
            </h3>
            <p className="text-gray-500 mb-6">
              {t("instructor.editCourse.announcements.noAnnouncementsDesc")}
            </p>
            <button
              onClick={handleCreateAnnouncement}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 cursor-pointer"
            >
              <FaPlus className="mr-2" />
              {t("instructor.editCourse.announcements.createFirstAnnouncement")}
            </button>
          </div>
        )}
      </div>

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAnnouncement}
        announcement={editingAnnouncement}
        courseId={course.id}
      />
    </div>
  );
};

export default AnnouncementsPanel;
