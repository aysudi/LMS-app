import { FaCamera, FaCheck } from "react-icons/fa";
import { useUpdateAvatar } from "../../hooks/useProfile";

type ModalContentProps = {
  user: any;
  profileForm: {
    firstName: string;
    lastName: string;
    username: string;
    bio: string;
  };
  handleProfileChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
};

const ModalContent = ({
  user,
  profileForm,
  handleProfileChange,
  fileInputRef,
}: ModalContentProps) => {
  const updateAvatarMutation = useUpdateAvatar();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Avatar Section */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg sm:text-2xl font-bold mx-auto mb-4 overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              user.avatarOrInitials
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={updateAvatarMutation.isPending}
            className="absolute -bottom-1 -right-1 sm:bottom-4 sm:right-0 w-7 h-7 sm:w-8 sm:h-8 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
          >
            <FaCamera className="text-xs sm:text-sm" />
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Personal Information
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={profileForm.username}
              onChange={handleProfileChange}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="email"
                defaultValue={user.email}
                className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
              {user.isEmailVerified ? (
                <span className="px-3 py-2 bg-green-100 text-green-800 text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1 whitespace-nowrap">
                  <FaCheck className="text-xs" />
                  Verified
                </span>
              ) : (
                <button className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm rounded-lg whitespace-nowrap">
                  Verify
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileChange}
              placeholder="Tell us about yourself, your interests, and learning goals..."
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalContent;
