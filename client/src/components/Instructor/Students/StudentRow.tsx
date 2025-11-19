import { useTranslation } from "react-i18next";
import { FaEnvelope, FaEye } from "react-icons/fa";

interface StudentRowProps {
  student: any;
  onSendMessage: () => void;
}

const StudentRow: React.FC<StudentRowProps> = ({ student, onSendMessage }) => {
  const { t } = useTranslation();
  const progressPercent = student.enrollment?.progressPercentage || 0;

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {student.student.firstName?.[0]}
            {student.student.lastName?.[0]}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {student.student.firstName} {student.student.lastName}
            </p>
            <p className="text-sm text-gray-500">{student.student.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-gray-900">
          {student.course?.title || "Course Title"}
        </p>
        <p className="text-sm text-gray-500">
          {student.course?.category || "Category"}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {progressPercent}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(
          student.enrollment?.enrolledAt || Date.now()
        ).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {student.enrollment?.lastAccessedAt
          ? new Date(student.enrollment.lastAccessedAt).toLocaleDateString()
          : t("instructor.students.never")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={onSendMessage}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            title={t("instructor.students.sendMessage")}
          >
            <FaEnvelope />
          </button>
          <button
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            title={t("instructor.students.viewProfile")}
          >
            <FaEye />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StudentRow;
