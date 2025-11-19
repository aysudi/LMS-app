import { FaFileUpload, FaPlus, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../UI/ToastProvider";
import { generalToasts } from "../../../../utils/toastUtils";

interface LessonResource {
  id: string;
  name: string;
  file?: File;
  url?: string;
  type: "pdf" | "zip" | "doc" | "other";
}

type Props = {
  resources: LessonResource[];
  setResources: (resources: LessonResource[]) => void;
};

const Resources = ({ resources, setResources }: Props) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const addResource = () => {
    const newResource: LessonResource = {
      id: `resource-${Date.now()}`,
      name: "",
      type: "pdf",
    };
    setResources([...resources, newResource]);
  };

  const updateResource = (id: string, updates: Partial<LessonResource>) => {
    setResources(
      resources.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const removeResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  const handleResourceFileChange = (id: string, file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      // 50MB
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonCreate.toasts.fileTooLarge"),
          t("instructor.editCourse.lessonCreate.validation.resourceTooLarge")
        )
      );
      return;
    }

    updateResource(id, { file, name: file.name });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaFileUpload className="mr-2 text-indigo-600" />
          {t("instructor.editCourse.lessonCreate.lessonResources")}
        </h2>
        <button
          onClick={addResource}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer"
        >
          <FaPlus className="mr-2" />
          {t("instructor.editCourse.lessonCreate.addResource")}
        </button>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl"
          >
            <div className="flex-1">
              <input
                type="text"
                value={resource.name}
                onChange={(e) =>
                  updateResource(resource.id, { name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder={t(
                  "instructor.editCourse.lessonCreate.customNamePlaceholder"
                )}
              />
            </div>
            <select
              value={resource.type}
              onChange={(e) =>
                updateResource(resource.id, {
                  type: e.target.value as any,
                })
              }
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="pdf">
                {t("instructor.editCourse.lessonCreate.resourceTypes.pdf")}
              </option>
              <option value="zip">
                {t("instructor.editCourse.lessonCreate.resourceTypes.zip")}
              </option>
              <option value="doc">
                {t("instructor.editCourse.lessonCreate.resourceTypes.doc")}
              </option>
              <option value="other">
                {t("instructor.editCourse.lessonCreate.resourceTypes.other")}
              </option>
            </select>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleResourceFileChange(resource.id, file);
              }}
              className="text-sm"
            />
            <button
              onClick={() => removeResource(resource.id)}
              className="text-red-600 hover:text-red-700 p-2 cursor-pointer"
            >
              <FaTrash />
            </button>
          </div>
        ))}

        {resources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaFileUpload className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>{t("instructor.editCourse.lessonCreate.noResourcesAdded")}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Resources;
