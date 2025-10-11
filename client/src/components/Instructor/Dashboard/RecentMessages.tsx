import { motion } from "framer-motion";
import { FaComment } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Message {
  _id: string;
  student: {
    firstName: string;
    lastName: string;
  };
  subject: string;
  status: string;
  createdAt: string;
}

interface RecentMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

const RecentMessages: React.FC<RecentMessagesProps> = ({
  messages,
  isLoading,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recent Messages
        </h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
        <button
          onClick={() => navigate("/instructor/messages")}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View All
        </button>
      </div>

      {messages?.length === 0 ? (
        <div className="text-center py-8">
          <FaComment className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages?.slice(0, 5).map((message) => (
            <div
              key={message._id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() => navigate(`/instructor/messages/${message._id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {message.student.firstName} {message.student.lastName}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        message.status === "unread"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {message.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {message.subject}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RecentMessages;
