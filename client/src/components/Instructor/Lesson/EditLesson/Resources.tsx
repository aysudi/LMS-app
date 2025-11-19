import { FaFileUpload, FaPlus, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useToast } from "../../../UI/ToastProvider";
import { useTranslation } from "react-i18next";
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
  const { showToast } = useToast();
  const { t } = useTranslation();

  const updateResource = (id: string, updates: Partial<LessonResource>) => {
    const updatedResources = resources.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    setResources(updatedResources);
  };

  const addResource = () => {
    const newResource: LessonResource = {
      id: `resource-${Date.now()}`,
      name: "",
      type: "other",
    };
    setResources([...resources, newResource]);
  };
  const removeResource = async (id: string) => {
    const filteredResources = resources.filter((r) => r.id != id);
    setResources(filteredResources);
  };

  const handleResourceFileChange = (id: string, file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      showToast(
        generalToasts.error(
          t("instructor.editCourse.lessonEdit.toasts.fileTooLarge"),
          t("instructor.editCourse.lessonEdit.validation.resourceTooLarge")
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
          {t("instructor.editCourse.lessonEdit.lessonResources")}
        </h2>
        <button
          onClick={addResource}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <FaPlus className="mr-2" />
          {t("instructor.editCourse.lessonEdit.addResource")}
        </button>
      </div>

      {resources.length > 0 ? (
        <div className="grid gap-4">
          {resources.map((resource, index) => (
            <div
              key={resource.id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  {t("instructor.editCourse.lessonEdit.resource", {
                    index: index + 1,
                  })}
                </h3>
                <button
                  onClick={() => removeResource(resource.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("instructor.editCourse.lessonEdit.file")}
                  </label>
                  {resource.url ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 p-2 bg-white rounded border">
                        {t("instructor.editCourse.lessonEdit.current", {
                          name: resource.name,
                        })}
                      </div>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleResourceFileChange(resource.id, file);
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        accept=".pdf,.doc,.docx,.zip,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.avi,.mov,.rar,.7z"
                      />
                      <div className="text-xs text-gray-500">
                        {t(
                          "instructor.editCourse.lessonEdit.leaveEmptyToKeepCurrent"
                        )}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleResourceFileChange(resource.id, file);
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      accept=".pdf,.doc,.docx,.zip,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.avi,.mov,.rar,.7z"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("instructor.editCourse.lessonEdit.type")}
                  </label>
                  <select
                    value={resource.type}
                    onChange={(e) =>
                      updateResource(resource.id, {
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="pdf">
                      {t("instructor.editCourse.lessonEdit.resourceTypes.pdf")}
                    </option>
                    <option value="zip">
                      {t("instructor.editCourse.lessonEdit.resourceTypes.zip")}
                    </option>
                    <option value="doc">
                      {t("instructor.editCourse.lessonEdit.resourceTypes.doc")}
                    </option>
                    <option value="other">
                      {t(
                        "instructor.editCourse.lessonEdit.resourceTypes.other"
                      )}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("instructor.editCourse.lessonEdit.name")}
                  </label>
                  <input
                    type="text"
                    value={resource.name}
                    onChange={(e) =>
                      updateResource(resource.id, {
                        name: e.target.value,
                      })
                    }
                    placeholder={t(
                      "instructor.editCourse.lessonEdit.customNamePlaceholder"
                    )}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <FaFileUpload className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {t("instructor.editCourse.lessonEdit.noResourcesAdded")}
          </h3>
          <p className="text-gray-400">
            {t("instructor.editCourse.lessonEdit.noResourcesDesc")}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default Resources;
