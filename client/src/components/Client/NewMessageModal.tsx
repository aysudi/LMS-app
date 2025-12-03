import React, { useState } from "react";
import { X, User, BookOpen, Send } from "lucide-react";
import { useSendMessage } from "../../hooks/useStudentInstructorMessages";
import RichTextEditor from "../UI/RichTextEditor";
import type { EnrolledInstructor } from "../../services/studentInstructorMessage.service";

interface NewMessageModalProps {
  instructors: EnrolledInstructor[];
  onClose: () => void;
  onSuccess: () => void;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({
  instructors,
  onClose,
  onSuccess,
}) => {
  const [selectedInstructor, setSelectedInstructor] =
    useState<EnrolledInstructor | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.map((n) => n.charAt(0).toUpperCase()).join("");
  };

  const sendMessageMutation = useSendMessage();

  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.instructor.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      instructor.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInstructor || !subject.trim() || !content.trim()) {
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        instructor: selectedInstructor.instructor._id,
        course: selectedInstructor.course._id,
        subject: subject.trim(),
        content: content.trim(),
      });
      onSuccess();
    } catch (error) {
      // Error handled in the mutation
    }
  };

  const handleSelectInstructor = (instructor: EnrolledInstructor) => {
    setSelectedInstructor(instructor);
    setSearchTerm("");
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">New Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Instructor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Instructor
            </label>

            {selectedInstructor ? (
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                {selectedInstructor.instructor.avatar ? (
                  <img
                    src={selectedInstructor.instructor.avatar}
                    alt={selectedInstructor.instructor.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-medium text-sm">
                    {getInitials(selectedInstructor.instructor.fullName)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {selectedInstructor.instructor.fullName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedInstructor.course.title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInstructor(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search instructors or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                  {filteredInstructors.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm
                        ? "No instructors found"
                        : "No enrolled courses"}
                    </div>
                  ) : (
                    filteredInstructors.map((instructor) => (
                      <button
                        key={`${instructor.instructor._id}-${instructor.course._id}`}
                        type="button"
                        onClick={() => handleSelectInstructor(instructor)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0 cursor-pointer"
                      >
                        {instructor.instructor.avatar ? (
                          <img
                            src={instructor.instructor.avatar}
                            alt={instructor.instructor.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-medium text-sm">
                            {getInitials(instructor.instructor.fullName)}
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {instructor.instructor.fullName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {instructor.course.title}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {subject.length}/200 characters
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your message to the instructor..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !selectedInstructor ||
                !subject.trim() ||
                !content.trim() ||
                sendMessageMutation.isPending
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMessageModal;
