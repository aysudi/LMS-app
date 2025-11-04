import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
// @ts-ignore
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import type { Course } from "../../types/course.type";
import {
  useCourse,
  useUpdateCourse,
  useDeleteCourse,
  useSubmitCourseForApproval,
  useSaveAsDraft,
} from "../../hooks/useCourseHooks";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import ErrorState from "../../components/UI/ErrorState";
import BasicInfoPanel from "../../components/Instructor/EditCourse/BasicInfoPanel";
import CurriculumPanel from "../../components/Instructor/EditCourse/CurriculumPanel";
import MediaPanel from "../../components/Instructor/EditCourse/MediaPanel";
import AnnouncementsPanel from "../../components/Instructor/EditCourse/AnnouncementsPanel";
import SettingsPanel from "../../components/Instructor/EditCourse/SettingsPanel";
import { useToast } from "../../components/UI/ToastProvider";
import { courseToasts } from "../../utils/toastUtils";
import Swal from "sweetalert2";

// TABS will be defined inside component to use translation

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const TABS = [
    {
      id: "basic-info",
      label: t("instructor.editCourse.tabs.basicInformation"),
      icon: "📝",
    },
    {
      id: "curriculum",
      label: t("instructor.editCourse.tabs.curriculum"),
      icon: "📚",
    },
    { id: "media", label: t("instructor.editCourse.tabs.media"), icon: "🎬" },
    {
      id: "announcements",
      label: t("instructor.editCourse.tabs.announcements"),
      icon: "📢",
    },
    {
      id: "settings",
      label: t("instructor.editCourse.tabs.settings"),
      icon: "⚙️",
    },
  ] as const;

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>(
    (searchParams.get("tab") as (typeof TABS)[number]["id"]) || "basic-info"
  );
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [formChanges, setFormChanges] = useState<Partial<Course>>({});
  const [tabChanges, setTabChanges] = useState<Record<string, Partial<Course>>>(
    {}
  );

  const { data: courseData, isLoading, error, refetch } = useCourse(courseId!);
  const { showToast } = useToast();

  const updateCourseMutation = useUpdateCourse({
    onSuccess: () => {
      const courseTitle = courseData?.data?.title || "Course";
      showToast(courseToasts.updated(courseTitle));
      setUnsavedChanges(false);
      setTabChanges((prev) => ({ ...prev, [activeTab]: {} }));
    },
    onError: () => {
      showToast(courseToasts.updateError());
    },
  });

  const deleteMutation = useDeleteCourse({
    onSuccess: () => {
      showToast(courseToasts.deleted());
      navigate("/instructor/courses");
    },
    onError: () => {
      showToast(courseToasts.deleteError());
    },
  });

  const submitForApprovalMutation = useSubmitCourseForApproval({
    onSuccess: () => {
      showToast({
        type: "success",
        title: t("instructor.editCourse.courseSubmitted"),
        message: t("instructor.editCourse.courseSubmittedMessage"),
      });
    },
    onError: () => {
      showToast({
        type: "error",
        title: t("instructor.editCourse.submissionFailed"),
        message: t("instructor.editCourse.submissionFailedMessage"),
      });
    },
  });

  const saveAsDraftMutation = useSaveAsDraft({
    onSuccess: () => {
      showToast({
        type: "success",
        title: t("instructor.editCourse.savedAsDraft"),
        message: t("instructor.editCourse.savedAsDraftMessage"),
      });
    },
    onError: () => {
      showToast({
        type: "error",
        title: t("instructor.editCourse.saveFailed"),
        message: t("instructor.editCourse.saveFailedMessage"),
      });
    },
  });

  useEffect(() => {
    const shouldRefresh = localStorage.getItem("refreshCurriculum");
    if (shouldRefresh) {
      localStorage.removeItem("refreshCurriculum");
      refetch();
    }
  }, [refetch]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChanges]);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !courseData)
    return (
      <ErrorState message={t("instructor.editCourse.failedToLoadCourse")} />
    );

  const handlePanelUpdate = (changes: Partial<Course>) => {
    setUnsavedChanges(true);
    setFormChanges((prev) => ({
      ...prev,
      ...changes,
    }));
    setTabChanges((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        ...changes,
      },
    }));
  };

  const handleTabSave = async () => {
    try {
      const currentTabChanges = tabChanges[activeTab];
      if (!currentTabChanges || Object.keys(currentTabChanges).length === 0) {
        return;
      }

      // Convert tab changes to UpdateCourseData format
      const updateData: any = {
        ...currentTabChanges,
      };

      await updateCourseMutation.mutateAsync({
        courseId: courseId!,
        updateData,
      });

      setTabChanges((prev) => ({
        ...prev,
        [activeTab]: {},
      }));

      const remainingChanges = { ...formChanges };
      Object.keys(currentTabChanges).forEach((key) => {
        delete remainingChanges[key as keyof Course];
      });
      setFormChanges(remainingChanges);

      if (Object.keys(remainingChanges).length === 0) {
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Failed to save tab changes:", error);
    }
  };

  const handleDeleteCourse = async () => {
    const courseTitle = courseData?.data?.title || "this course";

    const result = await Swal.fire({
      title: t("instructor.editCourse.deleteConfirmation.title"),
      text: t("instructor.editCourse.deleteConfirmation.message", {
        courseTitle,
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("instructor.editCourse.deleteConfirmation.confirm"),
      cancelButtonText: t("common.cancel"),
    });
    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(courseId!);
      } catch (error) {
        console.error("Failed to delete course:", error);
      }
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      await submitForApprovalMutation.mutateAsync(courseId!);
    } catch (error) {
      console.error("Failed to submit course for approval:", error);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      const updateData: any = formChanges || {};
      await saveAsDraftMutation.mutateAsync({
        courseId: courseId!,
        updateData,
      });
      setFormChanges({});
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save course as draft:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/instructor/courses")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {courseData.data.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {t("common.lastUpdated", {
                    date: new Date(
                      courseData.data.updatedAt
                    ).toLocaleDateString(),
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-indigo-600 border-t border-r border-l border-gray-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "basic-info" && (
            <BasicInfoPanel
              course={courseData.data}
              onUpdate={handlePanelUpdate}
              onSave={handleTabSave}
              isSaving={updateCourseMutation.isPending}
              hasChanges={
                !!tabChanges[activeTab] &&
                Object.keys(tabChanges[activeTab]).length > 0
              }
            />
          )}
          {activeTab === "curriculum" && (
            <CurriculumPanel
              course={courseData.data}
              onUpdate={handlePanelUpdate}
              onSave={handleTabSave}
              isSaving={updateCourseMutation.isPending}
              hasChanges={
                !!tabChanges[activeTab] &&
                Object.keys(tabChanges[activeTab]).length > 0
              }
            />
          )}
          {activeTab === "media" && (
            <MediaPanel course={courseData.data} onUpdate={handlePanelUpdate} />
          )}
          {activeTab === "announcements" && (
            <AnnouncementsPanel
              course={courseData.data}
              onUpdate={handlePanelUpdate}
              onSave={handleTabSave}
              isSaving={updateCourseMutation.isPending}
              hasChanges={
                !!tabChanges[activeTab] &&
                Object.keys(tabChanges[activeTab]).length > 0
              }
            />
          )}
          {activeTab === "settings" && (
            <SettingsPanel
              course={courseData.data}
              onUpdate={handlePanelUpdate}
              onSave={handleTabSave}
              isSaving={updateCourseMutation.isPending}
              hasChanges={
                !!tabChanges[activeTab] &&
                Object.keys(tabChanges[activeTab]).length > 0
              }
              onDelete={handleDeleteCourse}
              onSubmitForApproval={handleSubmitForApproval}
              onSaveAsDraft={handleSaveAsDraft}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EditCourse;
