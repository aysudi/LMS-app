import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaTimes, FaSave, FaSpinner } from "react-icons/fa";
import { toast } from "react-hot-toast";
import type { Section } from "../../../types/course.type";

interface SectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionData: {
    title: string;
    description: string;
    thumbnail?: File;
  }) => Promise<void>;
  section?: Section;
  isLoading?: boolean;
}

const SectionEditorModal = ({
  isOpen,
  onClose,
  onSave,
  section,
  isLoading = false,
}: SectionEditorModalProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(section?.title || "");
  const [description, setDescription] = useState(section?.description || "");
  const [thumbnailFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Section title is required");
      return;
    }

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnailFile || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error saving section:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {section ? "Edit Section" : "Create New Section"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {section
                  ? "Update section details"
                  : "Add a new section to your course"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("instructor.editCourse.sectionEditor.sectionTitle")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder={t(
                  "instructor.editCourse.sectionEditor.sectionTitlePlaceholder"
                )}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("instructor.editCourse.sectionEditor.description")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder={t(
                  "instructor.editCourse.sectionEditor.descriptionPlaceholder"
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaSave className="mr-2" />
                )}
                {section
                  ? t("instructor.editCourse.sectionEditor.updateSection")
                  : t("instructor.editCourse.sectionEditor.createSectionBtn")}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SectionEditorModal;
