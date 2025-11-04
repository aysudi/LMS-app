import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaUpload, FaImage, FaVideo, FaTrash } from "react-icons/fa";
import type { Course } from "../../../types/course.type";

interface MediaPanelProps {
  course: Course;
  onUpdate: (changes: Partial<Course>) => void;
}

const MediaPanel = ({ course, onUpdate }: MediaPanelProps) => {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState<string | null>(
    course.image?.url || null
  );
  const [previewVideo, setPreviewVideo] = useState<string | null>(
    course.videoPromo?.url || null
  );
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      onUpdate({
        image: {
          url: previewUrl,
          publicId: course.image?.publicId || "",
          file,
        },
      });
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewVideo(previewUrl);
      onUpdate({
        videoPromo: {
          url: previewUrl,
          publicId: course.videoPromo?.publicId || "",
          file,
        },
      });
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    onUpdate({
      image: {
        url: "",
        publicId: "",
      },
    });
  };

  const removeVideo = () => {
    setPreviewVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
    onUpdate({
      videoPromo: {
        url: "",
        publicId: "",
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="space-y-8">
          {/* Course Image */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t("instructor.editCourse.media.courseImage")}
            </h3>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  {previewImage ? (
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden">
                      <img
                        src={previewImage}
                        alt={t(
                          "instructor.editCourse.media.courseImagePreview"
                        )}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <FaImage size={24} />
                      <span className="mt-2 text-sm">
                        {t("instructor.editCourse.media.uploadImage")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">
                  <p>
                    {t("instructor.editCourse.media.imageRecommendations.size")}
                  </p>
                  <p>
                    {t(
                      "instructor.editCourse.media.imageRecommendations.maxSize"
                    )}
                  </p>
                  <p>
                    {t(
                      "instructor.editCourse.media.imageRecommendations.formats"
                    )}
                  </p>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {!previewImage && (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <FaUpload className="mr-2" />
                    {t("instructor.editCourse.media.chooseImage")}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Promotional Video */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t("instructor.editCourse.media.promotionalVideo")}
            </h3>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  {previewVideo ? (
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden bg-black">
                      <video
                        src={previewVideo}
                        className="w-full h-full object-cover"
                        controls
                      />
                      <button
                        onClick={removeVideo}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <FaVideo size={24} />
                      <span className="mt-2 text-sm">
                        {t("instructor.editCourse.media.uploadVideo")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">
                  <p>
                    {t(
                      "instructor.editCourse.media.videoRecommendations.duration"
                    )}
                  </p>
                  <p>
                    {t(
                      "instructor.editCourse.media.videoRecommendations.maxSize"
                    )}
                  </p>
                  <p>
                    {t(
                      "instructor.editCourse.media.videoRecommendations.formats"
                    )}
                  </p>
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                {!previewVideo && (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <FaUpload className="mr-2" />
                    {t("instructor.editCourse.media.chooseVideo")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPanel;
