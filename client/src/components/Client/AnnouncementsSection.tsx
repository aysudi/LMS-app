import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaBullhorn,
  FaClock,
  FaUsers,
  FaExclamationTriangle,
  FaInfo,
  FaSpinner,
} from "react-icons/fa";
import {
  useAnnouncementsByCourse,
  useAnnouncementMutations,
} from "../../hooks/useAnnouncements";
import type { Announcement } from "../../types/announcement.type";

interface AnnouncementsSectionProps {
  courseId: string;
}

const priorityConfig = {
  low: {
    color: "text-slate-400",
    bg: "bg-slate-800/20 border-slate-600/20",
    icon: FaInfo,
    accent: "text-slate-300",
  },
  medium: {
    color: "text-blue-400",
    bg: "bg-blue-900/15 border-blue-600/20",
    icon: FaInfo,
    accent: "text-blue-300",
  },
  high: {
    color: "text-amber-400",
    bg: "bg-amber-900/15 border-amber-600/20",
    icon: FaExclamationTriangle,
    accent: "text-amber-300",
  },
  urgent: {
    color: "text-rose-400",
    bg: "bg-rose-900/15 border-rose-600/20",
    icon: FaExclamationTriangle,
    accent: "text-rose-300",
  },
};

const AnnouncementCard: React.FC<{
  announcement: Announcement;
  onMarkAsRead: (id: string) => void;
}> = ({ announcement, onMarkAsRead }) => {
  const PriorityIcon = priorityConfig[announcement.priority].icon;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReadMore = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onMarkAsRead(announcement._id);
    }
  };

  const isLongContent = announcement.content.length > 200;
  const displayContent =
    isExpanded || !isLongContent
      ? announcement.content
      : announcement.content.substring(0, 200) + "...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/10 ${
        priorityConfig[announcement.priority].bg
      } border-slate-700/30 hover:border-slate-600/50`}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h4 className="font-bold text-xl text-white leading-tight">
                {announcement.title}
              </h4>

              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  priorityConfig[announcement.priority].bg
                } ${priorityConfig[announcement.priority].color}`}
              >
                <PriorityIcon className="mr-1.5 h-3 w-3" />
                {announcement.priority}
              </span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-slate-400 mb-4">
              <div className="flex items-center space-x-2">
                <FaClock className="h-3.5 w-3.5" />
                <span>
                  {announcement.createdAt
                    ? new Date(announcement.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : new Date(announcement.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <FaUsers className="h-3.5 w-3.5" />
                <span>
                  {announcement.targetAudience === "all"
                    ? "All students"
                    : announcement.targetAudience === "enrolled"
                    ? "Enrolled students"
                    : "Students who completed the course"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-300">
                  <span className="text-slate-400">from</span>{" "}
                  {announcement.instructor.firstName}{" "}
                  {announcement.instructor.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="text-slate-200 leading-relaxed prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />

        {isLongContent && (
          <button
            onClick={handleReadMore}
            className={`mt-4 text-sm font-medium transition-colors hover:underline ${
              priorityConfig[announcement.priority].accent
            }`}
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  courseId,
}) => {
  const { announcements, isLoading, error } = useAnnouncementsByCourse(
    courseId,
    {
      limit: 20,
    }
  );

  const { markAsRead } = useAnnouncementMutations();

  const handleMarkAsRead = (announcementId: string) => {
    markAsRead.mutate(announcementId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin h-6 w-6 text-purple-500" />
          <span className="text-gray-400">Loading announcements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          Error loading announcements
        </h3>
        <p className="text-gray-400">
          Please try refreshing the page or contact support if the problem
          persists.
        </p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📢</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          No announcements yet
        </h3>
        <p className="text-gray-400">
          Your instructor hasn't posted any announcements for this course yet.
          Check back later for important updates!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="text-gray-300">
          <span className="font-medium">{announcements.length}</span>{" "}
          announcement
          {announcements.length !== 1 ? "s" : ""} from your instructor
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-6">
        {announcements.map((announcement) => (
          <AnnouncementCard
            key={announcement._id}
            announcement={announcement}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pt-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-full border border-purple-500/20">
          <FaBullhorn className="text-purple-400 text-sm" />
          <span className="text-gray-400 text-sm">
            Stay updated with the latest course announcements
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsSection;
