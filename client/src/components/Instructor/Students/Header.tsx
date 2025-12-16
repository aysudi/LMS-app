import { useSnackbar } from "notistack";
import { useState } from "react";
import { exportStudentsData } from "../../../services/instructor.service";
import { FaDownload } from "react-icons/fa";
import { t } from "i18next";
import { motion } from "framer-motion";

type Props = {
  selectedCourse: string;
  instructorCourses: Array<{
    _id: string;
    title: string;
  }>;
};

const Header = ({ selectedCourse, instructorCourses }: Props) => {
  const [isExporting, setIsExporting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleExportData = async () => {
    const courseId =
      selectedCourse === "all" ? instructorCourses[0]?._id : selectedCourse;

    if (!courseId) {
      enqueueSnackbar("Please select a course to export data", {
        variant: "warning",
      });
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportStudentsData(courseId, "csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `students-data-${courseId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      enqueueSnackbar("Students data exported successfully!", {
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to export students data",
        {
          variant: "error",
        }
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("navigation.students")}
        </h1>
        <p className="text-gray-600 mt-2">
          {t("instructor.manageTrackStudentsProgress")}
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExportData}
        disabled={isExporting || instructorCourses.length === 0}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <FaDownload className="text-sm" />
        )}
        <span>
          {isExporting ? "Exporting..." : t("instructor.students.exportData")}
        </span>
      </motion.button>
    </motion.div>
  );
};

export default Header;
