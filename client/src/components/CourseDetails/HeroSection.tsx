import { FaAward, FaGlobe } from "react-icons/fa";
import HTMLRenderer from "../../utils/htmlRenderer";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import renderStars from "../../utils/renderStars";

const HeroSection = ({ course }: { course: any }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-purple-200 mb-4">
            <button
              onClick={() => navigate("/courses")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t("courseDetails.courses")}
            </button>
            <span>›</span>
            <span className="text-purple-300">{course.category}</span>
            {course.subcategory && (
              <>
                <span>›</span>
                <span className="text-purple-200">{course.subcategory}</span>
              </>
            )}
          </nav>

          {/* Course Title & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 sm:mb-6"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4">
              {course.title}
            </h1>
            <div className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-6 max-w-3xl">
              {course.shortDescription ? (
                <HTMLRenderer
                  content={course.shortDescription}
                  className="text-gray-600"
                  maxLength={200}
                />
              ) : (
                <HTMLRenderer
                  content={course.description}
                  className="text-gray-600"
                  maxLength={200}
                />
              )}
            </div>
          </motion.div>

          {/* Course Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-6"
          >
            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="text-orange-400 font-bold text-base sm:text-lg">
                {course.rating.toFixed(1)}
              </span>
              <div className="flex items-center gap-1">
                {renderStars(course.rating)}
              </div>
              <span className="text-orange-300 text-xs sm:text-sm underline cursor-pointer">
                ({course.ratingsCount.toLocaleString()}{" "}
                {t("courseDetails.ratings")})
              </span>
            </div>

            {/* Students */}
            <div className="text-gray-300 text-sm sm:text-base">
              {course.studentsEnrolled.length.toLocaleString()}{" "}
              {t("courseDetails.students")}
            </div>

            {/* Level */}
            <div className="px-2 sm:px-3 py-1 bg-yellow-500 text-yellow-900 text-xs sm:text-sm font-medium rounded">
              {course.level}
            </div>
          </motion.div>

          {/* Instructor & Last Updated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300"
          >
            <div className="flex items-center gap-2">
              <span>{t("courseDetails.createdBy")}</span>
              <span className="text-purple-300 underline cursor-pointer">
                {course.instructor.firstName} {course.instructor.lastName}
              </span>
            </div>
            <div>
              {t("courseDetails.lastUpdated", {
                date: new Date(course.lastUpdated).toLocaleDateString(),
              })}
            </div>
            <div className="flex items-center gap-1">
              <FaGlobe />
              <span>{course.language}</span>
            </div>
            {course.certificateProvided && (
              <div className="flex items-center gap-1">
                <FaAward className="text-yellow-400" />
                <span>{t("courseDetails.certificate")}</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
