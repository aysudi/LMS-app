import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaComments, FaSearch, FaGraduationCap } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { useUserEnrollments } from "../../hooks/useEnrollment";
import { useSocket } from "../../hooks/useSocket";
import {
  useCourseMessages,
  useMarkMessagesAsRead,
  useUnreadMessageCounts,
} from "../../hooks/useCourseMessages";
import { useQueryClient } from "@tanstack/react-query";
import type { CourseMessage as ICourseMessage } from "../../services/courseMessage.service";
import CoursesList from "../../components/Client/Messages/CoursesList";
import MessagesComponent from "../../components/Client/Messages/Messages";
import ChatHeader from "../../components/Client/Messages/ChatHeader";
import MessagesInput from "../../components/Client/Messages/MessagesInput";

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
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileCourses, setShowMobileCourses] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { socket, joinCourseRoom, leaveCourseRoom } = useSocket();

  const { data: enrollmentsResponse } = useUserEnrollments();
  const enrollments = enrollmentsResponse?.data?.enrollments || [];

  const { data: messagesResponse, refetch } = useCourseMessages(
    selectedCourse?._id || "",
    1,
    50
  );
  const markAsReadMutation = useMarkMessagesAsRead();
  const { refetch: refetchUnreadCounts } = useUnreadMessageCounts();

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

  const handleBack = () => {
    if (isMobileView) {
      setSelectedCourse(null);
      setShowMobileCourses(true);
    }
  };

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
            <CoursesList
              filteredCourses={filteredCourses}
              selectedCourse={selectedCourse}
              handleCourseSelect={handleCourseSelect}
            />
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
                <ChatHeader
                  selectedCourse={selectedCourse}
                  isMobileView={isMobileView}
                  handleBack={handleBack}
                />

                {/* Messages */}
                <MessagesComponent
                  user={user}
                  messagesResponse={messagesResponse}
                  messagesEndRef={messagesEndRef}
                />

                {/* Message Input */}
                <MessagesInput
                  selectedCourse={selectedCourse}
                  user={user}
                  queryClient={queryClient}
                  refetch={refetch}
                />
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
