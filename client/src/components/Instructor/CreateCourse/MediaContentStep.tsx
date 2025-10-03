import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCloudUploadAlt, 
  FaImage, 
  FaVideo, 
  FaTimes, 
  FaPlay, 
  FaCheckCircle,
  FaExclamationTriangle 
} from 'react-icons/fa';

interface MediaContentStepProps {
  formData: {
    image: File | null;
    videoPromo: File | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
}

const MediaContentStep: React.FC<MediaContentStepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState<'image' | 'video' | null>(null);
  const [previews, setPreviews] = useState<{
    image: string | null;
    video: string | null;
  }>({
    image: null,
    video: null,
  });

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    setFormData((prev: any) => ({ ...prev, image: file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviews(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      alert('Video size should be less than 100MB');
      return;
    }

    setFormData((prev: any) => ({ ...prev, videoPromo: file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviews(prev => ({ ...prev, video: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (type === 'image') {
        handleImageUpload(files[0]);
      } else {
        handleVideoUpload(files[0]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const removeFile = (type: 'image' | 'video') => {
    setFormData((prev: any) => ({ ...prev, [type]: null }));
    setPreviews(prev => ({ ...prev, [type]: null }));
    
    if (type === 'image' && imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    if (type === 'video' && videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      key="media-content"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Media & Content
          </h2>
          <p className="text-gray-600">
            Add visual elements to make your course more appealing. A good course image and promotional video can significantly increase enrollment.
          </p>
        </div>

        <div className="space-y-8">
          {/* Course Image Upload */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaImage className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Course Image</h3>
                <p className="text-sm text-gray-600">Upload an engaging thumbnail for your course</p>
              </div>
            </div>

            {!formData.image ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  dragOver === 'image'
                    ? 'border-blue-400 bg-blue-100'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDrop={(e) => handleDrop(e, 'image')}
                onDragOver={(e) => handleDragOver(e, 'image')}
                onDragLeave={handleDragLeave}
                onClick={() => imageInputRef.current?.click()}
              >
                <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Click to upload or drag and drop
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Recommended: 1280x720 pixels (16:9 ratio)
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 5MB
                </p>
                
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  {previews.image && (
                    <img
                      src={previews.image}
                      alt="Course thumbnail"
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile('image')}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-sm text-gray-700">{formData.image.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatFileSize(formData.image.size)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Promotional Video Upload */}
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaVideo className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Promotional Video 
                  <span className="text-gray-500 text-sm ml-2">(Optional)</span>
                </h3>
                <p className="text-sm text-gray-600">A short video introducing your course</p>
              </div>
            </div>

            {!formData.videoPromo ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  dragOver === 'video'
                    ? 'border-purple-400 bg-purple-100'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
                onDrop={(e) => handleDrop(e, 'video')}
                onDragOver={(e) => handleDragOver(e, 'video')}
                onDragLeave={handleDragLeave}
                onClick={() => videoInputRef.current?.click()}
              >
                <FaPlay className="mx-auto text-4xl text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Click to upload or drag and drop
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Keep it short and engaging (30-120 seconds recommended)
                </p>
                <p className="text-xs text-gray-500">
                  MP4, MOV, AVI up to 100MB
                </p>
                
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  {previews.video && (
                    <video
                      src={previews.video}
                      className="w-full h-64 object-cover"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile('video')}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-sm text-gray-700">{formData.videoPromo.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatFileSize(formData.videoPromo.size)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Media Guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="text-amber-500 mt-1" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-3">Media Guidelines</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
                  <div>
                    <h5 className="font-medium mb-2">Course Image:</h5>
                    <ul className="space-y-1">
                      <li>• Use high-quality, clear images</li>
                      <li>• Avoid text-heavy designs</li>
                      <li>• Keep it professional and relevant</li>
                      <li>• 1280x720 px recommended</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Promotional Video:</h5>
                    <ul className="space-y-1">
                      <li>• Keep it under 2 minutes</li>
                      <li>• Introduce yourself and the course</li>
                      <li>• Show what students will learn</li>
                      <li>• Use good audio quality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaContentStep;
