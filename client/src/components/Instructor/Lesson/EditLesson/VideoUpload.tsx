import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaVideo } from "react-icons/fa";
import { useToast } from "../../../UI/ToastProvider";
import { generalToasts } from "../../../../utils/toastUtils";

type Props = {
  setVideoFile: (file: File | null) => void;
  setDuration: (duration: number) => void;
  setVideoPreview: (preview: string) => void;
  videoPreview: string;
  duration: number;
  videoFile: File | null;
  currentLesson: any;
};

const VideoUpload = ({
  setVideoFile,
  setDuration,
  setVideoPreview,
  videoPreview,
  duration,
  videoFile,
  currentLesson,
}: Props) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonEdit.toasts.selectVideo"),
          t("instructor.editCourse.lessonEdit.validation.selectVideoFile")
        )
      );
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonEdit.toasts.fileTooLarge"),
          t("instructor.editCourse.lessonEdit.validation.videoTooLarge")
        )
      );
      return;
    }

    setVideoFile(file);

    showToast(
      generalToasts.success(
        t("instructor.editCourse.lessonEdit.toasts.videoUploaded", {
          name: file.name,
        }),
        t("instructor.editCourse.lessonEdit.toasts.videoUploaded", {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <FaVideo className="mr-2 text-indigo-600" />
        {t("instructor.editCourse.lessonEdit.lessonVideo")}
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
                {t("instructor.editCourse.lessonEdit.duration", {
                  minutes: duration,
                })}
              </span>
              {!videoFile && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {t("instructor.editCourse.lessonEdit.currentVideo")}
                </span>
              )}
            </div>
            <div className="space-x-2">
              <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm">
                {t("instructor.editCourse.lessonEdit.changeVideo")}
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
                {t("instructor.editCourse.lessonEdit.reset")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <FaVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {t("instructor.editCourse.lessonEdit.uploadReplacementVideo")}
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
  );
};

export default VideoUpload;
