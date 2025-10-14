import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Mail, CheckCircle } from "lucide-react";
import { useCertificateGeneration } from "../../hooks/useCertificate";
import type { Course } from "../../types/course.type";

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  userId: string;
  userEmail: string;
  studentName: string;
}

export const CourseCompletionModal: React.FC<CourseCompletionModalProps> = ({
  isOpen,
  onClose,
  course,
  userId,
  userEmail,
  studentName,
}) => {
  const { completeCourseWithCertificate, isGeneratingCertificate } =
    useCertificateGeneration();
  const [certificateGenerated, setCertificateGenerated] = React.useState(false);

  const instructorName = `${course.instructor.firstName} ${course.instructor.lastName}`;

  const handleGenerateCertificate = async () => {
    completeCourseWithCertificate({
      course,
      userId,
      userEmail,
      studentName,
      instructorName,
    });
    setCertificateGenerated(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4"
                >
                  <Award className="w-10 h-10" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  Congratulations! 🎉
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-sm"
                >
                  You've successfully completed the course
                </motion.p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm">By {instructorName}</p>
              </div>

              {/* Certificate Section */}
              {course.certificateProvided && (
                <div className="border border-gray-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Certificate Available
                      </h4>
                      <p className="text-sm text-gray-600">
                        Get your certificate of completion
                      </p>
                    </div>
                  </div>

                  {!certificateGenerated ? (
                    <button
                      onClick={handleGenerateCertificate}
                      disabled={isGeneratingCertificate}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {isGeneratingCertificate ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating Certificate...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Generate & Send Certificate
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          Certificate sent to your email!
                        </span>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          📧 Certificate sent to your email
                        </p>
                        <p className="text-xs text-gray-500">
                          Check your inbox for the PDF certificate
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Course Stats */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Course Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Lessons</p>
                    <p className="font-semibold text-gray-900">
                      {course.totalLessons}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {Math.floor(course.totalDuration / 60)}h{" "}
                      {course.totalDuration % 60}m
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Level</p>
                    <p className="font-semibold text-gray-900">
                      {course.level}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rating</p>
                    <p className="font-semibold text-gray-900">
                      ⭐ {course.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Explore More
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CourseCompletionModal;
