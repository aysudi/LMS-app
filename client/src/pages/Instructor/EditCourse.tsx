import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { toast } from "react-hot-toast";
import type { Course } from "../../types/course.type";
import { useCourse, useUpdateCourse } from "../../hooks/useCourseQueries";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import ErrorState from "../../components/UI/ErrorState";
import BasicInfoPanel from "../../components/Instructor/EditCourse/BasicInfoPanel";
import CurriculumPanel from "../../components/Instructor/EditCourse/CurriculumPanel";
import MediaPanel from "../../components/Instructor/EditCourse/MediaPanel";
import SettingsPanel from "../../components/Instructor/EditCourse/SettingsPanel";

const TABS = [
  { id: "basic-info", label: "Basic Information", icon: "📝" },
  { id: "curriculum", label: "Curriculum", icon: "📚" },
  { id: "media", label: "Media", icon: "🎬" },
  { id: "settings", label: "Settings", icon: "⚙️" },
] as const;

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("basic-info");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [formChanges, setFormChanges] = useState<Partial<Course>>({});

  // Fetch course data
  const { data: courseData, isLoading, error } = useCourse(courseId!);

  // Update course mutation
  const updateCourseMutation = useUpdateCourse({
    onSuccess: () => {
      toast.success("Course updated successfully!");
      setUnsavedChanges(false);
    },
    onError: (error) => {
      toast.error("Failed to update course. Please try again.");
      console.error("Error updating course:", error);
    },
  });

  // Handle unsaved changes
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
    return <ErrorState message="Failed to load course" />;

  const handlePanelUpdate = (changes: Partial<Course>) => {
    setUnsavedChanges(true);
    setFormChanges((prev) => ({
      ...prev,
      ...changes,
    }));
  };

  const handleSave = async () => {
    try {
      if (!formChanges || Object.keys(formChanges).length === 0) {
        return;
      }

      // Convert formChanges to UpdateCourseData format
      const updateData: any = {
        ...formChanges,
      };

      await updateCourseMutation.mutateAsync({
        courseId: courseId!,
        updateData,
      });

      // Reset changes after successful save
      setFormChanges({});
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save course changes:", error);
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
                  Last updated:{" "}
                  {new Date(courseData.data.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {unsavedChanges && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
              <button
                onClick={handleSave}
                disabled={!unsavedChanges || updateCourseMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave className="mr-2" />
                {updateCourseMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
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
            />
          )}
          {activeTab === "curriculum" && (
            <CurriculumPanel
              course={courseData.data}
              onUpdate={handlePanelUpdate}
            />
          )}
          {activeTab === "media" && (
            <MediaPanel course={courseData.data} onUpdate={handlePanelUpdate} />
          )}
          {activeTab === "settings" && (
            <SettingsPanel
              course={courseData.data}
              onUpdate={handlePanelUpdate}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EditCourse;
