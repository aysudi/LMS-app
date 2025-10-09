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
import type { Lesson, Section } from "../../types/course.type";
import RichTextEditor from "../../components/UI/RichTextEditor";
import { useCourse } from "../../hooks/useCourseQueries";
import { enqueueSnackbar } from "notistack";
import { useUpdateLesson } from "../../hooks/useLessonMutations";

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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      enqueueSnackbar("Please select a video file", { variant: "error" });
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      enqueueSnackbar("Video size should be less than 500MB", {
        variant: "error",
      });
      return;
    }

    setVideoFile(file);

    enqueueSnackbar(`📹 Video "${file.name}" uploaded successfully!`, {
      variant: "success",
      autoHideDuration: 3000,
    });

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
      type: "other", // Default to 'other' to avoid confusion
    };
    setResources([...resources, newResource]);
    console.log("Added new resource:", newResource);
  };

  const updateResource = (id: string, updates: Partial<LessonResource>) => {
    console.log("Updating resource:", id, "with updates:", updates);
    const updatedResources = resources.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    setResources(updatedResources);
    console.log("All resources after update:", updatedResources);
  };

  const removeResource = async (id: string) => {
    const filteredResources = resources.filter((r) => r.id != id);
    setResources(filteredResources);
  };

  const handleResourceFileChange = (id: string, file: File) => {
    console.log(
      "File selected:",
      file.name,
      "Type:",
      file.type,
      "Size:",
      file.size
    );

    if (file.size > 50 * 1024 * 1024) {
      enqueueSnackbar("File size should be less than 50MB", {
        variant: "error",
      });
      return;
    }

    updateResource(id, { file, name: file.name });
    console.log("Updated resource with file:", {
      id,
      fileName: file.name,
      fileType: file.type,
    });
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
      enqueueSnackbar("Lesson title is required", { variant: "error" });
      return;
    }

    if (!lessonId) {
      enqueueSnackbar("Lesson ID is missing", { variant: "error" });
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

      console.log("Description value:", JSON.stringify(description));

      if (videoFile) {
        updateData.video = { file: videoFile };
      }

      // Separate existing and new resources
      const existingResources = resources.filter((r) => r.url && !r.file); // Resources that already exist in DB
      const newResources = resources.filter((r) => r.file && !r.url); // New resources to upload

      // Include existing resources that should be kept (this tells server which ones to preserve)
      updateData.existingResources = existingResources.map((r) => ({
        name: r.name,
        type: r.type,
        url: r.url,
      }));

      // Include new resources for upload
      if (newResources.length > 0) {
        updateData.resources = newResources.map((r) => ({
          name: r.name || r.file?.name || "Untitled Resource",
          type: r.type,
          file: r.file,
        }));
      }

      console.log("Update data being sent:");
      console.log("- Basic data:", {
        title: updateData.title,
        description: updateData.description,
      });
      console.log(
        "- Existing resources to keep:",
        updateData.existingResources
      );
      console.log(
        "- New resources to upload:",
        updateData.resources?.map((r: any) => ({
          name: r.name,
          type: r.type,
          hasFile: !!r.file,
        }))
      );

      await updateLessonMutation.mutateAsync({
        lessonId: lessonId!,
        updateData,
      });

      enqueueSnackbar("✨ Lesson updated successfully!", {
        variant: "success",
        autoHideDuration: 4000,
      });

      setTimeout(() => {
        navigate(`/instructor/courses/${courseId}/edit?tab=curriculum`);
      }, 1000);
    } catch (error) {
      console.error("Error updating lesson:", error);
      enqueueSnackbar(
        (error as any)?.response?.data?.message ||
          "❌ Failed to update lesson. Please try again.",
        {
          variant: "error",
          autoHideDuration: 6000,
        }
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
                  Edit Lesson
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
              Update Lesson
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
                      {!videoFile && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Current Video
                        </span>
                      )}
                    </div>
                    <div className="space-x-2">
                      <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm">
                        Change Video
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => {
                          setVideoFile(null);
                          if (currentLesson?.video?.url) {
                            setVideoPreview(currentLesson.video.url);
                          } else {
                            setVideoPreview("");
                          }
                        }}
                        className="text-red-600 hover:text-red-700 px-4 py-2 text-sm"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <FaVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Upload replacement video
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
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <FaPlus className="mr-2" />
                  Add Resource
                </button>
              </div>

              {resources.length > 0 ? (
                <div className="grid gap-4">
                  {resources.map((resource, index) => (
                    <div
                      key={resource.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          Resource {index + 1}
                        </h3>
                        <button
                          onClick={() => removeResource(resource.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            File
                          </label>
                          {resource.url ? (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600 p-2 bg-white rounded border">
                                Current: {resource.name}
                              </div>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file)
                                    handleResourceFileChange(resource.id, file);
                                }}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                accept=".pdf,.doc,.docx,.zip,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.avi,.mov,.rar,.7z"
                              />
                              <div className="text-xs text-gray-500">
                                Leave empty to keep current file
                              </div>
                            </div>
                          ) : (
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                  handleResourceFileChange(resource.id, file);
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              accept=".pdf,.doc,.docx,.zip,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.avi,.mov,.rar,.7z"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                          </label>
                          <select
                            value={resource.type}
                            onChange={(e) =>
                              updateResource(resource.id, {
                                type: e.target.value as any,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="pdf">PDF Document</option>
                            <option value="zip">ZIP Archive</option>
                            <option value="doc">Document</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={resource.name}
                            onChange={(e) =>
                              updateResource(resource.id, {
                                name: e.target.value,
                              })
                            }
                            placeholder="Custom name for this resource"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FaFileUpload className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    No Resources Added
                  </h3>
                  <p className="text-gray-400">
                    Add supplementary materials like PDFs, documents, or other
                    files to enhance your lesson.
                  </p>
                </div>
              )}
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
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
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
                        className="text-red-600 hover:text-red-700 p-1"
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

export default LessonEditPage;
