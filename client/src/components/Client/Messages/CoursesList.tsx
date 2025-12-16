import { FaBook, FaUsers } from "react-icons/fa";
import { useUnreadMessageCounts } from "../../../hooks/useCourseMessages";
import { t } from "i18next";
import { motion } from "framer-motion";

type Props = {
  filteredCourses: any[];
  selectedCourse: any;
  handleCourseSelect: any;
};

const CoursesList = ({
  filteredCourses,
  selectedCourse,
  handleCourseSelect,
}: Props) => {
  const { data: unreadCounts } = useUnreadMessageCounts();

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredCourses.length === 0 ? (
        <div className="p-6 text-center">
          <FaBook className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500">{t("messages.noCoursesFound")}</p>
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {filteredCourses.map((course) => {
            const isSelected = selectedCourse?._id === course._id;
            const unreadCount = unreadCounts?.data?.[course._id] || 0;

            return (
              <motion.div
                key={course._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCourseSelect(course)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                  isSelected
                    ? "bg-blue-50 border-blue-500 shadow-md"
                    : "bg-gray-50 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaBook className="text-blue-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium truncate ${
                        isSelected ? "text-blue-700" : "text-gray-800"
                      }`}
                    >
                      {course.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <FaUsers className="mr-1" />
                        <span>
                          {course.studentsCount || 0}{" "}
                          {course.studentsCount === 1
                            ? t("messages.student")
                            : t("messages.students")}
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoursesList;
