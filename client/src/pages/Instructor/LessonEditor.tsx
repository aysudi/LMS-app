import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaSave, FaVideo, FaSpinner } from "react-icons/fa";
import type { Section } from "../../types/course.type";
import RichTextEditor from "../../components/UI/RichTextEditor";
import { useCourse } from "../../hooks/useCourseHooks";
import { useCreateLesson } from "../../hooks/useLessonMutations";
import { useToast } from "../../components/UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";
import Resources from "../../components/Instructor/Lesson/CreateLesson/Resources";
import QuizSection from "../../components/Instructor/Lesson/CreateLesson/QuizSection";
import Settings from "../../components/Instructor/Lesson/CreateLesson/Settings";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface LessonResource {
  id: string;
  name: string;
  file?: File;
  url?: string;
  type: "pdf" | "zip" | "doc" | "other";
}

const LessonEditor = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const { showToast } = useToast();
  const { t } = useTranslation();

  const { data: courseData, isLoading: courseLoading } = useCourse(courseId!);

  const createLessonMutation = useCreateLesson(courseId!, sectionId!);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const isLoading = createLessonMutation.isPending;

  const currentSection = courseData?.data.sections.find(
    (s: Section) => s._id === sectionId
  );

  // Initialize empty form - this is create-only
  useEffect(() => {
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setVideoPreview("");
    setDuration(0);
    setIsPreview(false);
    setResources([]);
    setQuiz([]);
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast(
        generalToasts.warning(
          t("instructor.editCourse.lessonCreate.toasts.selectVideo"),
          t("instructor.editCourse.lessonCreate.validation.selectVideoFile")
        )
      );
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonCreate.toasts.fileTooLarge"),
          t("instructor.editCourse.lessonCreate.validation.videoTooLarge")
        )
      );
      return;
    }

    setVideoFile(file);

    showToast(
      generalToasts.success(
        t("instructor.editCourse.lessonCreate.toasts.videoUploaded", {
          name: file.name,
        }),
        t("instructor.editCourse.lessonCreate.toasts.videoUploaded", {
          name: file.name,
        })
      )
    );

    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.onloadedmetadata = () => {
      setDuration(Math.floor(videoElement.duration / 60));
      URL.revokeObjectURL(videoElement.src);
    };
    videoElement.src = URL.createObjectURL(file);
    setVideoPreview(videoElement.src);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonCreate.validation.titleRequired"),
          t("instructor.editCourse.lessonCreate.validation.titleRequired")
        )
      );
      return;
    }

    if (!videoFile && !videoPreview) {
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonCreate.validation.videoRequired"),
          t("instructor.editCourse.lessonCreate.validation.videoRequired")
        )
      );
      return;
    }

    try {
      const validQuiz = quiz.filter(
        (q) =>
          q.question &&
          q.question.trim() &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          q.options.every((opt: string) => opt && opt.trim()) &&
          typeof q.correctAnswer === "number" &&
          q.correctAnswer >= 0 &&
          q.correctAnswer < q.options.length
      );

      const lessonDataForAPI = {
        title,
        description,
        duration: duration * 60, // Convert to seconds
        isPreview,
        video: videoFile, // Pass the File directly
        resources: resources.filter((r) => r.file),
        quiz: validQuiz,
      };

      await createLessonMutation.mutateAsync(lessonDataForAPI as any);

      showToast(
        generalToasts.success(
          t("instructor.editCourse.lessonCreate.lessonCreated"),
          t("instructor.editCourse.lessonCreate.lessonCreated")
        )
      );
      navigate(`/instructor/courses/${courseId}/edit?tab=curriculum`);
    } catch (error) {
      console.error("Error creating lesson:", error);
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonCreate.creationFailed"),
          (error as any)?.response?.data?.message ||
            t("instructor.editCourse.lessonCreate.creationFailed")
        )
      );
    }
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() =>
                  navigate(
                    `/instructor/courses/${courseId}/edit?tab=curriculum`
                  )
                }
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("instructor.editCourse.lessonCreate.title")}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentSection?.title} • {courseData?.data.title}
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              {isLoading
                ? t("instructor.editCourse.lessonCreate.creating")
                : t("instructor.editCourse.lessonCreate.createLesson")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t("instructor.editCourse.lessonCreate.basicInformation")}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("instructor.editCourse.lessonCreate.lessonTitle")}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t(
                      "instructor.editCourse.lessonCreate.lessonTitlePlaceholder"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("instructor.editCourse.lessonCreate.description")}
                  </label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder={t(
                      "instructor.editCourse.lessonCreate.descriptionPlaceholder"
                    )}
                  />
                </div>
              </div>
            </motion.div>

            {/* Video Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FaVideo className="mr-2 text-indigo-600" />
                {t("instructor.editCourse.lessonCreate.lessonVideo")}
              </h2>

              {videoPreview ? (
                <div className="space-y-4">
                  <video
                    controls
                    className="w-full h-64 bg-black rounded-xl"
                    src={videoPreview}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {t("instructor.editCourse.lessonCreate.duration", {
                          minutes: duration,
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview("");
                        setDuration(0);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      {t("instructor.editCourse.lessonCreate.removeVideo")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <FaVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {t(
                        "instructor.editCourse.lessonCreate.uploadYourLessonVideo"
                      )}
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 "
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Resources */}
            <Resources resources={resources} setResources={setResources} />

            {/* Quiz Section */}
            <QuizSection quiz={quiz} setQuiz={setQuiz} />
          </div>

          {/* Right Column - Settings */}
          <Settings
            isPreview={isPreview}
            setIsPreview={setIsPreview}
            duration={duration}
            setDuration={setDuration}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonEditor;
