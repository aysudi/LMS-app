import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaSave,
  FaVideo,
  FaFileUpload,
  FaPlus,
  FaTrash,
  FaQuestionCircle,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";
import type { Section } from "../../types/course.type";
import RichTextEditor from "../../components/UI/RichTextEditor";
import { useCourse } from "../../hooks/useCourseHooks";
import { useCreateLesson } from "../../hooks/useLessonMutations";
import { useToast } from "../../components/UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";

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

  const { data: courseData, isLoading: courseLoading } = useCourse(courseId!);

  // Mutation hook for creation only
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
        generalToasts.warning("Select a video", "Please select a video file")
      );
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      showToast(
        generalToasts.error(
          "File too large",
          "Video size should be less than 500MB"
        )
      );
      return;
    }

    setVideoFile(file);

    showToast(
      generalToasts.success(
        "Video Uploaded",
        `Video "${file.name}" uploaded successfully!`
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

  const addResource = () => {
    const newResource: LessonResource = {
      id: `resource-${Date.now()}`,
      name: "",
      type: "pdf",
    };
    setResources([...resources, newResource]);
  };

  const updateResource = (id: string, updates: Partial<LessonResource>) => {
    setResources(
      resources.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const removeResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  const handleResourceFileChange = (id: string, file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      // 50MB
      showToast(
        generalToasts.error(
          "File too large",
          "File size should be less than 50MB"
        )
      );
      return;
    }

    updateResource(id, { file, name: file.name });
  };

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `question-${Date.now()}`,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setQuiz([...quiz, newQuestion]);
  };

  const updateQuizQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuiz(quiz.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuizQuestion = (id: string) => {
    setQuiz(quiz.filter((q) => q.id !== id));
  };

  const updateQuizOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    const question = quiz.find((q) => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuizQuestion(questionId, { options: newOptions });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast(
        generalToasts.error("Title is required", "Please enter a lesson title")
      );
      return;
    }

    if (!videoFile && !videoPreview) {
      showToast(
        generalToasts.error(
          "Video is required",
          "Please upload a video for this lesson"
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
          "Lesson created",
          "🎉 Lesson created successfully!"
        )
      );
      navigate(`/instructor/courses/${courseId}/edit?tab=curriculum`);
    } catch (error) {
      console.error("Error creating lesson:", error);
      showToast(
        generalToasts.error(
          "Creation failed",
          (error as any)?.response?.data?.message ||
            "❌ Failed to create lesson. Please try again."
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
                  Create New Lesson
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
              Create Lesson
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
                Basic Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter lesson title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Describe what students will learn in this lesson..."
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
                Lesson Video
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
                        Duration: {duration} minutes
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
                      Remove Video
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <FaVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Upload your lesson video
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaFileUpload className="mr-2 text-indigo-600" />
                  Lesson Resources
                </h2>
                <button
                  onClick={addResource}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer"
                >
                  <FaPlus className="mr-2" />
                  Add Resource
                </button>
              </div>

              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={resource.name}
                        onChange={(e) =>
                          updateResource(resource.id, { name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="Resource name..."
                      />
                    </div>
                    <select
                      value={resource.type}
                      onChange={(e) =>
                        updateResource(resource.id, {
                          type: e.target.value as any,
                        })
                      }
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="pdf">PDF</option>
                      <option value="zip">ZIP</option>
                      <option value="doc">Document</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleResourceFileChange(resource.id, file);
                      }}
                      className="text-sm"
                    />
                    <button
                      onClick={() => removeResource(resource.id)}
                      className="text-red-600 hover:text-red-700 p-2 cursor-pointer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}

                {resources.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaFileUpload className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No resources added yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quiz Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaQuestionCircle className="mr-2 text-indigo-600" />
                  Lesson Quiz
                </h2>
                <button
                  onClick={addQuizQuestion}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer"
                >
                  <FaPlus className="mr-2" />
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {quiz.map((question, qIndex) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        Question {qIndex + 1}
                      </h3>
                      <button
                        onClick={() => removeQuizQuestion(question.id)}
                        className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <textarea
                        value={question.question}
                        onChange={(e) =>
                          updateQuizQuestion(question.id, {
                            question: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="Enter question..."
                        rows={2}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() =>
                                updateQuizQuestion(question.id, {
                                  correctAnswer: oIndex,
                                })
                              }
                              className="text-green-600 focus:ring-green-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateQuizOption(
                                  question.id,
                                  oIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              placeholder={`Option ${oIndex + 1}...`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {quiz.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaQuestionCircle className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No quiz questions added yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Lesson Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Preview Lesson
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Allow free preview of this lesson
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPreview(!isPreview)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isPreview ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPreview ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    {isPreview ? (
                      <FaEye className="mr-2 text-green-600" />
                    ) : (
                      <FaEyeSlash className="mr-2 text-gray-400" />
                    )}
                    {isPreview
                      ? "Visible to all students"
                      : "Only for enrolled students"}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonEditor;
