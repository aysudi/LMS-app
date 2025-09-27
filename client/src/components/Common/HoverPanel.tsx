import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import type { Course } from "../../types/course.type";

interface HoverPanelProps {
  course: Course;
  isVisible: boolean;
  showOnLeft: boolean;
  children: React.ReactNode;
}

const HoverPanel: React.FC<HoverPanelProps> = ({
  course,
  isVisible,
  showOnLeft,
  children,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            x: showOnLeft ? 10 : -10,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            x: showOnLeft ? 10 : -10,
            scale: 0.95,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute -top-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden ${
            showOnLeft ? "right-full mr-2" : "left-full ml-2"
          }`}
          style={{
            maxHeight: "590px",
            minHeight: "420px",
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
              {course.title}
            </h4>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <FaStar className="text-yellow-400 text-sm" />
                <span className="font-semibold text-gray-700">
                  {course.rating || 4.5}
                </span>
                <span className="text-gray-500 text-sm">
                  ({Number(course.ratingsCount || 0).toLocaleString()} ratings)
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HoverPanel;
