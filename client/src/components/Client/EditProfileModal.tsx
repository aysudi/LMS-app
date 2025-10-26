import { useFormik } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import profileValidationSchema from "../../validations/profileValidation";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import type { User } from "../../types/user.type";
import type { EditProfileFormData } from "../../types/forms";
import { useToast } from "../UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";

type Props = {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
};

const EditProfileModal = ({ isEditing, setIsEditing }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const { showToast } = useToast();

  const editProfileFormik = useFormik<EditProfileFormData>({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      skills: user?.skills || [],
      socialLinks: {
        website: user?.socialLinks?.website || "",
        linkedin: user?.socialLinks?.linkedin || "",
        github: user?.socialLinks?.github || "",
        twitter: user?.socialLinks?.twitter || "",
      },
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log("Updating profile:", values);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        showToast(
          generalToasts.success(
            "Profile updated successfully!",
            `"${user?.firstName}"`
          )
        );
        setIsEditing(false);

        if (user) {
          const updatedUser = {
            ...user,
            ...values,
            socialLinks: {
              ...user.socialLinks,
              _id: user.socialLinks?._id || "",
              ...values.socialLinks,
            },
          };
          setUser(updatedUser as User);
        }
      } catch (error) {
        showToast(
          generalToasts.error(
            "Failed to update profile",
            `"${user?.firstName}"`
          )
        );
      }
    },
  });

  const handleAddSkill = () => {
    if (
      newSkill.trim() &&
      !editProfileFormik.values.skills.includes(newSkill.trim())
    ) {
      editProfileFormik.setFieldValue("skills", [
        ...editProfileFormik.values.skills,
        newSkill.trim(),
      ]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    editProfileFormik.setFieldValue(
      "skills",
      editProfileFormik.values.skills.filter((skill) => skill !== skillToRemove)
    );
  };

  return (
    <AnimatePresence>
      {isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditing(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-gray-600 text-lg" />
                </button>
              </div>

              <form
                onSubmit={editProfileFormik.handleSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      {...editProfileFormik.getFieldProps("firstName")}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    />
                    {editProfileFormik.touched.firstName &&
                      editProfileFormik.errors.firstName && (
                        <p className="text-red-500 text-sm mt-2">
                          {editProfileFormik.errors.firstName}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...editProfileFormik.getFieldProps("lastName")}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    />
                    {editProfileFormik.touched.lastName &&
                      editProfileFormik.errors.lastName && (
                        <p className="text-red-500 text-sm mt-2">
                          {editProfileFormik.errors.lastName}
                        </p>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...editProfileFormik.getFieldProps("bio")}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {editProfileFormik.values.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-800 rounded-full font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-violet-600 hover:text-violet-800"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddSkill())
                      }
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                    >
                      <FaPlus className="text-lg" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-4">
                    Social Links
                  </label>
                  <div className="space-y-4">
                    <input
                      type="url"
                      {...editProfileFormik.getFieldProps(
                        "socialLinks.linkedin"
                      )}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                      placeholder="LinkedIn URL"
                    />
                    <input
                      type="url"
                      {...editProfileFormik.getFieldProps("socialLinks.github")}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                      placeholder="GitHub URL"
                    />
                    <input
                      type="url"
                      {...editProfileFormik.getFieldProps(
                        "socialLinks.twitter"
                      )}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                      placeholder="Twitter URL"
                    />
                    <input
                      type="url"
                      {...editProfileFormik.getFieldProps(
                        "socialLinks.website"
                      )}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                      placeholder="Website URL"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={editProfileFormik.isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    <FaSave className="text-lg" />
                    <span>
                      {editProfileFormik.isSubmitting
                        ? "Saving..."
                        : "Save Changes"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
