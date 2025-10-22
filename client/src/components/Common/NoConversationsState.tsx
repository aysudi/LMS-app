import React from "react";
import { motion } from "framer-motion";
import {
  FaComments,
  FaGraduationCap,
  FaArrowRight,
  FaUsers,
} from "react-icons/fa";

interface NoConversationsStateProps {
  onStartConversation: () => void;
  hasEnrollments: boolean;
}

const NoConversationsState: React.FC<NoConversationsStateProps> = ({
  onStartConversation,
  hasEnrollments,
}) => {
  return (
    <div className="text-center py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaComments className="text-white text-3xl" />
        </div>

        {/* Title and Description */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Start Your Learning Conversations
        </h3>

        {hasEnrollments ? (
          <>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Connect with your instructors to ask questions, get help, and
              enhance your learning experience. Conversations are created
              automatically when you send your first message.
            </p>

            {/* How it works */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FaUsers className="text-sm" />
                How Messaging Works
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Choose a course you're enrolled in</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Send your first message to create a conversation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>
                    All future messages will appear in that conversation
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartConversation}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaComments />
              Start Your First Conversation
              <FaArrowRight className="text-sm" />
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6 leading-relaxed">
              To start messaging instructors, you need to be enrolled in at
              least one course. Browse our courses and enroll to begin your
              learning journey!
            </p>

            <div className="bg-amber-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <FaGraduationCap className="text-sm" />
                Get Started
              </h4>
              <p className="text-sm text-amber-800">
                Enroll in courses to unlock messaging with instructors and
                access all course materials.
              </p>
            </div>

            <button
              onClick={() => (window.location.href = "/courses")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaGraduationCap />
              Browse Courses
              <FaArrowRight className="text-sm" />
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default NoConversationsState;
