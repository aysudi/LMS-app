import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaCog, FaLock, FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useChangePassword } from "../../hooks/useProfile";
import { toast } from "react-toastify";

interface ProfileSettingsProps {
  user: any;
  profileForm: any;
  handleProfileChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  updateProfileMutation: any;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  profileForm,
  handleProfileChange,
  handleUpdateProfile,
  updateProfileMutation,
}) => {
  const { t } = useTranslation();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const changePasswordMutation = useChangePassword();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("profile.errors.passwordsDontMatch"));
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setIsChangingPassword(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Profile Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaUser className="text-purple-600" />
          {t("profile.settings.profileSettings")}
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.settings.firstName")}
              </label>
              <input
                type="text"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.settings.lastName")}
              </label>
              <input
                type="text"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("common.username")}
            </label>
            <input
              type="text"
              name="username"
              value={profileForm.username}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.settings.bio")}
            </label>
            <textarea
              rows={3}
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileChange}
              placeholder={t("profile.settings.bioPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md transition-colors disabled:cursor-not-allowed cursor-pointer"
          >
            {updateProfileMutation.isPending
              ? t("common.saving")
              : t("profile.settings.saveChanges")}
          </button>
        </form>
      </div>

      {/* Account Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaCog className="text-purple-600" />
          {t("profile.settings.accountSettings")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.settings.emailAddress")}
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                defaultValue={user.email}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {user.isEmailVerified ? (
                <span className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-md flex items-center gap-1">
                  <FaCheck className="text-xs" />
                  {t("profile.verified")}
                </span>
              ) : (
                <button className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-md">
                  {t("profile.settings.verify")}
                </button>
              )}
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {t("profile.settings.changePassword")}
            </button>
          </div>

          {/* Password Change Form */}
          {isChangingPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaLock className="text-blue-600 text-sm" />
                  </div>
                  {t("profile.settings.changePassword")}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("profile.settings.currentPassword")}
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder={t("profile.settings.enterCurrentPassword")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("profile.settings.newPassword")}
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        placeholder={t("profile.settings.enterNewPassword")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("profile.settings.confirmPassword")}
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        placeholder={t(
                          "profile.settings.confirmPasswordPlaceholder"
                        )}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-200">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 font-medium"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium flex items-center gap-2 shadow-md"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        {t("profile.settings.changing")}
                      </>
                    ) : (
                      <>
                        <FaCheck className="text-sm" />
                        {t("profile.settings.changePassword")}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Password Requirements */}
              <div className="mt-4 p-4 bg-white/60 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t("profile.settings.passwordRequirements")}
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• {t("profile.settings.atLeast6Characters")}</li>
                  <li>• {t("profile.settings.useStrongPassword")}</li>
                  <li>• {t("profile.settings.considerPasswordManager")}</li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">
          {t("profile.settings.dangerZone")}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-900">
                {t("profile.settings.deleteAccount")}
              </h4>
              <p className="text-sm text-red-700">
                {t("profile.settings.deleteAccountDescription")}
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
              {t("profile.settings.deleteAccount")}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
