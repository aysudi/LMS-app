import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaSave, FaSpinner } from "react-icons/fa";
import type { Lesson, Section } from "../../types/course.type";
import RichTextEditor from "../../components/UI/RichTextEditor";
import { useCourse } from "../../hooks/useCourseHooks";
import { useUpdateLesson } from "../../hooks/useLessonMutations";
import { useToast } from "../../components/UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";
import Resources from "../../components/Instructor/Lesson/EditLesson/Resources";
import QuizSection from "../../components/Instructor/Lesson/EditLesson/QuizSection";
import VideoUpload from "../../components/Instructor/Lesson/EditLesson/VideoUpload";
import Settings from "../../components/Instructor/Lesson/EditLesson/Settings";

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

const LessonEditPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const { lessonId } = useParams();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const { data: courseData, isLoading: courseLoading } = useCourse(courseId!);

  const updateLessonMutation = useUpdateLesson(courseId!, sectionId!);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);

  const currentSection = courseData?.data.sections.find(
    (s: Section) => s._id === sectionId
  );

  const currentLesson = currentSection?.lessons.find(
    (l: Lesson) => l._id === lessonId
  );

  useEffect(() => {
    if (currentLesson) {
      setTitle(currentLesson.title || "");
      setDescription(currentLesson.description || "");

      if (currentLesson.video?.url) {
        setVideoPreview(currentLesson.video.url);
      }

      setDuration(
        currentLesson.duration ? Math.floor(currentLesson.duration / 60) : 0
      );
      setIsPreview(currentLesson.isPreview || false);

      if (currentLesson.resources && Array.isArray(currentLesson.resources)) {
        setResources(
          currentLesson.resources.map((r: any, index: number) => ({
            id: `resource-${index}`,
            name: r.name || "",
            url: r.url || "",
            type: r.type || "pdf",
          }))
        );
      }

      if (currentLesson.quiz && Array.isArray(currentLesson.quiz)) {
        setQuiz(
          currentLesson.quiz.map((q: any, index: number) => ({
            id: `question-${index}`,
            question: q.question || "",
            options: Array.isArray(q.options)
              ? [...q.options]
              : ["", "", "", ""],
            correctAnswer: q.correctAnswer || 0,
          }))
        );
      }
    }
  }, [currentLesson]);

  const isLoading = updateLessonMutation.isPending;

  const handleSave = async () => {
    if (!title.trim()) {
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonEdit.validation.titleRequired"),
          t("instructor.editCourse.lessonEdit.validation.titleRequired")
        )
      );
      return;
    }

    if (!lessonId) {
      showToast(
        generalToasts.error(
          "Lesson ID is missing",
          "Please provide a lesson ID"
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
      const updateData: any = {
        title: title.trim(),
        description: description,
        duration: duration * 60, // Convert to seconds
        isPreview,
        quiz: validQuiz,
      };

      if (videoFile) {
        updateData.video = { file: videoFile };
      }

      const existingResources = resources.filter((r) => r.url && !r.file);
      const newResources = resources.filter((r) => r.file && !r.url);

      updateData.existingResources = existingResources.map((r) => ({
        name: r.name,
        type: r.type,
        url: r.url,
      }));

      if (newResources.length > 0) {
        updateData.resources = newResources.map((r) => ({
          name: r.name || r.file?.name || "Untitled Resource",
          type: r.type,
          file: r.file,
        }));
      }

      await updateLessonMutation.mutateAsync({
        lessonId: lessonId!,
        updateData,
      });

      showToast(
        generalToasts.success(
          t("instructor.editCourse.lessonEdit.lessonUpdated"),
          t("instructor.editCourse.lessonEdit.lessonUpdated")
        )
      );

      setTimeout(() => {
        navigate(`/instructor/courses/${courseId}/edit?tab=curriculum`);
      }, 1000);
    } catch (error) {
      console.error("Error updating lesson:", error);
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonEdit.updateFailed"),
          (error as any)?.response?.data?.message ||
            t("instructor.editCourse.lessonEdit.updateFailed")
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

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Lesson Not Found
          </h2>
          <p className="text-gray-600">
            The lesson you're trying to edit doesn't exist.
          </p>
          <button
            onClick={() =>
              navigate(`/instructor/courses/${courseId}/edit?tab=curriculum`)
            }
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Curriculum
          </button>
        </div>
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
                  {t("instructor.editCourse.lessonEdit.title")}
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
                ? t("instructor.editCourse.lessonEdit.saving")
                : t("instructor.editCourse.lessonEdit.saveChanges")}
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
                {t("instructor.editCourse.lessonEdit.basicInformation")}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("instructor.editCourse.lessonEdit.lessonTitle")}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t(
                      "instructor.editCourse.lessonEdit.lessonTitlePlaceholder"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("instructor.editCourse.lessonEdit.description")}
                  </label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder={t(
                      "instructor.editCourse.lessonEdit.descriptionPlaceholder"
                    )}
                  />
                </div>
              </div>
            </motion.div>

            {/* Video Upload */}
            <VideoUpload
              setVideoFile={setVideoFile}
              setDuration={setDuration}
              setVideoPreview={setVideoPreview}
              videoPreview={videoPreview}
              duration={duration}
              videoFile={videoFile}
              currentLesson={currentLesson}
            />

            {/* Resources */}
            <Resources resources={resources} setResources={setResources} />

            {/* Quiz Section */}
            <QuizSection quiz={quiz} setQuiz={setQuiz} />
          </div>

          {/* Right Column - Settings */}
          <Settings
            duration={duration}
            isPreview={isPreview}
            setDuration={setDuration}
            setIsPreview={setIsPreview}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonEditPage;
