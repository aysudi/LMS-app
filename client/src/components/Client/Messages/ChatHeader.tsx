import { t } from "i18next";
import { FaAngleLeft, FaBook, FaUsers } from "react-icons/fa";

type Props = {
  selectedCourse: any;
  isMobileView: boolean;
  handleBack: () => void;
};

const ChatHeader = ({ selectedCourse, isMobileView, handleBack }: Props) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isMobileView && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
            >
              <FaAngleLeft className="text-gray-600" />
            </button>
          )}

          <div className="flex items-center space-x-3">
            {selectedCourse.thumbnail ? (
              <img
                src={selectedCourse.thumbnail}
                alt={selectedCourse.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaBook className="text-blue-600" />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedCourse.title}
              </h2>
              <p className="text-gray-600 flex items-center">
                <FaUsers className="mr-1" />
                {t("messages.groupChat")} • {selectedCourse.studentsCount || 0}{" "}
                {selectedCourse.studentsCount === 1
                  ? t("messages.student")
                  : t("messages.students")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
