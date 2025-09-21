import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaGraduationCap,
  FaClock,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaLock,
  FaEnvelope,
  FaCalendarAlt,
  FaStar,
  FaTrophy,
  FaChartLine,
  FaPlus,
  FaBell,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import {
  getCurrentUser,
  type User as BaseUser,
} from "../../services/user.service";

// Extended User interface for profile page
interface User extends BaseUser {
  bio?: string;
}

// Validation schema for edit profile form
const profileValidationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .required("Last name is required"),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .required("Username is required"),
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  bio: Yup.string().max(500, "Bio cannot exceed 500 characters"),
  skills: Yup.array().of(Yup.string()),
  socialLinks: Yup.object({
    website: Yup.string().url("Please enter a valid URL"),
    linkedin: Yup.string().url("Please enter a valid LinkedIn URL"),
    github: Yup.string().url("Please enter a valid GitHub URL"),
    twitter: Yup.string().url("Please enter a valid Twitter URL"),
  }),
});

interface EditProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  skills: string[];
  socialLinks: {
    website: string;
    linkedin: string;
    github: string;
    twitter: string;
  };
}

const Profile = () => {
  const { user: currentUser } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    checks: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
    },
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        enqueueSnackbar("Failed to load profile data", { variant: "error" });
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, enqueueSnackbar]);

  // Formik form for editing profile
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
        enqueueSnackbar("Profile updated successfully!", {
          variant: "success",
        });
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
        enqueueSnackbar("Failed to update profile", { variant: "error" });
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

  // Enhanced password strength evaluation
  const evaluatePasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    setPasswordStrength({ score, checks });
    return { score, checks };
  };

  // Password change functionality
  const validatePasswordForm = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else {
      const { score, checks } = evaluatePasswordStrength(
        passwordForm.newPassword
      );

      if (passwordForm.newPassword.length < 6) {
        errors.newPassword = "Password must be at least 6 characters";
      } else if (passwordForm.newPassword.length > 128) {
        errors.newPassword = "Password cannot exceed 128 characters";
      } else if (score < 3) {
        errors.newPassword = "Password is too weak. Please improve it.";
      } else if (!checks.lowercase) {
        errors.newPassword =
          "Password must contain at least one lowercase letter";
      } else if (!checks.uppercase) {
        errors.newPassword =
          "Password must contain at least one uppercase letter";
      } else if (!checks.number) {
        errors.newPassword = "Password must contain at least one number";
      }
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return (
      !errors.currentPassword && !errors.newPassword && !errors.confirmPassword
    );
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    setPasswordErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    // Evaluate password strength for new password
    if (field === "newPassword") {
      evaluatePasswordStrength(value);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      console.log("Changing password...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      enqueueSnackbar("Password changed successfully!", { variant: "success" });
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      enqueueSnackbar("Failed to change password", { variant: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 to-blue-600/90 backdrop-blur-sm"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-white text-4xl font-bold shadow-2xl group-hover:scale-105 transition-all duration-300">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  user.initials
                )}
              </div>
              <button className="absolute bottom-2 right-2 w-9 h-9 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer">
                <FaCamera className="text-base" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {user.fullName}
              </h1>
              <p className="text-lg text-violet-200 font-medium mb-4">
                @{user.username}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-white/90">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full">
                  <FaCalendarAlt className="text-violet-200" />
                  <span className="font-medium text-sm">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full">
                  <FaEnvelope className="text-violet-200" />
                  <span className="font-medium text-sm">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 border border-white/30 cursor-pointer"
              >
                <FaEdit className="text-base" />
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative -mt-5 max-w-7xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">12</div>
                <div className="text-violet-600 font-semibold text-sm">
                  Courses
                </div>
              </div>
            </div>
            <div className="w-full bg-violet-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full w-4/5"></div>
            </div>
            <p className="text-gray-600 mt-2 text-xs">80% completion rate</p>
          </div>

          <div className="bg-white backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaChartLine className="text-white text-lg" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">85%</div>
                <div className="text-blue-600 font-semibold text-sm">
                  Progress
                </div>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full w-5/6"></div>
            </div>
            <p className="text-gray-600 mt-2 text-xs">
              Above average performance
            </p>
          </div>

          <div className="bg-white backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaTrophy className="text-white text-lg" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">24</div>
                <div className="text-green-600 font-semibold text-sm">
                  Certificates
                </div>
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full w-full"></div>
            </div>
            <p className="text-gray-600 mt-2 text-xs">
              All achievements unlocked
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-6">
            {[
              { id: "overview", label: "Overview", icon: FaUser },
              { id: "courses", label: "My Courses", icon: FaGraduationCap },
              { id: "achievements", label: "Achievements", icon: FaTrophy },
              { id: "settings", label: "Settings", icon: FaLock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-3 font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "border-violet-600 text-violet-600 bg-violet-50/50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <tab.icon className="text-sm" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bio */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                  <FaUser className="text-white text-xs" />
                </div>
                About Me
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {user.bio ||
                  "No bio available yet. Click edit to add your story!"}
              </p>
            </div>

            {/* Skills */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FaStar className="text-white text-xs" />
                </div>
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-violet-100 to-blue-100 text-violet-800 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No skills added yet</p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                  <FaGlobe className="text-white text-xs" />
                </div>
                Connect
              </h3>
              <div className="space-y-3">
                {user.socialLinks?.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                  >
                    <FaLinkedin className="text-blue-600 text-lg" />
                    <span className="text-blue-700 font-medium group-hover:text-blue-800 text-sm">
                      LinkedIn
                    </span>
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <FaGithub className="text-gray-700 text-lg" />
                    <span className="text-gray-700 font-medium group-hover:text-gray-800 text-sm">
                      GitHub
                    </span>
                  </a>
                )}
                {user.socialLinks?.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors group"
                  >
                    <FaTwitter className="text-sky-600 text-lg" />
                    <span className="text-sky-700 font-medium group-hover:text-sky-800 text-sm">
                      Twitter
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Recent Activity */}
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
                        <FaClock className="text-white text-lg" />
                      </div>
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <FaTrophy className="text-white text-lg" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg">
                            Course Completed! 🎉
                          </p>
                          <p className="text-green-700 font-medium">
                            React Advanced - 2 days ago
                          </p>
                          <p className="text-gray-600">
                            You've mastered advanced React patterns and earned a
                            certificate!
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                          <FaGraduationCap className="text-white text-lg" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg">
                            New Enrollment
                          </p>
                          <p className="text-blue-700 font-medium">
                            TypeScript Basics - 1 week ago
                          </p>
                          <p className="text-gray-600 text-sm">
                            Started learning TypeScript fundamentals
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learning Progress */}
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                        <FaChartLine className="text-white text-lg" />
                      </div>
                      Learning Progress
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-gray-900">
                            This Month
                          </span>
                          <span className="text-2xl font-bold text-violet-600">
                            32h
                          </span>
                        </div>
                        <div className="w-full bg-violet-200 rounded-full h-4 mb-4">
                          <div className="bg-gradient-to-r from-violet-600 to-purple-600 h-4 rounded-full w-4/5"></div>
                        </div>
                        <p className="text-violet-700 font-medium">
                          80% of monthly goal achieved
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-gray-900">
                            Learning Streak
                          </span>
                          <span className="text-2xl font-bold text-blue-600">
                            7 days
                          </span>
                        </div>
                        <div className="flex gap-2 mb-3">
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full"
                            ></div>
                          ))}
                        </div>
                        <p className="text-blue-700 font-medium">
                          Amazing consistency! Keep it up! 🔥
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "courses" && (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                      <FaGraduationCap className="text-white text-lg" />
                    </div>
                    My Learning Journey
                  </h3>
                  <div className="space-y-6">
                    <div className="p-6 border-2 border-violet-200 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-gray-900">
                          React Advanced Mastery
                        </h4>
                        <span className="px-4 py-2 bg-violet-600 text-white rounded-full font-bold shadow-lg text-sm">
                          Completed ✓
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Master advanced React patterns, hooks, and performance
                        optimization techniques
                      </p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <div className="w-full bg-violet-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-violet-600 to-purple-600 h-3 rounded-full w-full"></div>
                          </div>
                        </div>
                        <span className="text-violet-600 font-bold text-xl">
                          100%
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-gray-600">
                        <span className="flex items-center gap-2">
                          <FaTrophy className="text-yellow-500 text-lg" />
                          Certificate Earned
                        </span>
                        <span>Completed 2 days ago</span>
                      </div>
                    </div>

                    <div className="p-6 border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-gray-900">
                          TypeScript Fundamentals
                        </h4>
                        <span className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg text-sm">
                          In Progress
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Learn TypeScript basics and build type-safe applications
                      </p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <div className="w-full bg-blue-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full w-3/4"></div>
                          </div>
                        </div>
                        <span className="text-blue-600 font-bold text-xl">
                          75%
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-gray-600">
                        <span>Started 1 week ago</span>
                        <span>3 modules remaining</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "achievements" && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-600 rounded-xl flex items-center justify-center">
                      <FaTrophy className="text-white text-lg" />
                    </div>
                    Achievements & Badges
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-6 border-2 border-yellow-200 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-shadow">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FaTrophy className="text-white text-3xl" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        Course Master
                      </h4>
                      <p className="text-gray-600">
                        Completed 10+ courses with excellence
                      </p>
                      <div className="mt-3 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium text-sm">
                        Earned 2 days ago
                      </div>
                    </div>

                    <div className="text-center p-6 border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-shadow">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FaGraduationCap className="text-white text-3xl" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        Quick Learner
                      </h4>
                      <p className="text-gray-600">
                        Completed courses faster than average
                      </p>
                      <div className="mt-3 px-3 py-2 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
                        Earned 1 week ago
                      </div>
                    </div>

                    <div className="text-center p-6 border-2 border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FaStar className="text-white text-3xl" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        Consistent Learner
                      </h4>
                      <p className="text-gray-600">
                        Maintained 7-day learning streak
                      </p>
                      <div className="mt-3 px-3 py-2 bg-green-100 text-green-800 rounded-full font-medium text-sm">
                        Active now
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Notifications */}
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                        <FaBell className="text-white text-lg" />
                      </div>
                      Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FaBell className="text-gray-600 text-xl" />
                          <div>
                            <p className="font-bold text-gray-900">
                              Email Notifications
                            </p>
                            <p className="text-gray-600 text-sm">
                              Course updates and announcements
                            </p>
                          </div>
                        </div>
                        <button className="w-12 h-7 bg-violet-600 rounded-full relative shadow-lg">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaLock className="text-white text-lg" />
                      </div>
                      <div>
                        <span className="text-gray-900">Security Center</span>
                        <p className="text-gray-600 text-sm font-normal">
                          Manage your account security
                        </p>
                      </div>
                    </h3>

                    <button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="w-full flex items-center justify-between rounded-2xl bg-white/70 transition-all duration-300 transform"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FaLock className="text-white text-lg" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900 text-2xl">
                            Change Password
                          </p>
                          <p className="text-gray-600 text-sm font-normal">
                            Update your account password securely
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-violet-600 transform transition-all duration-300 text-xl cursor-pointer ${
                          showChangePassword ? "rotate-180 scale-110" : ""
                        }`}
                      >
                        ▼
                      </div>
                    </button>

                    <AnimatePresence>
                      {showChangePassword && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, y: -20 }}
                          animate={{ height: "auto", opacity: 1, y: 0 }}
                          exit={{ height: 0, opacity: 0, y: -20 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 p-8 bg-gradient-to-br from-gray-50 via-white to-violet-50 rounded-2xl border-2 border-violet-100 shadow-2xl">
                            <div className="text-center mb-8">
                              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                                <FaLock className="text-white text-2xl" />
                              </div>
                              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                                Update Your Password
                              </h4>
                              <p className="text-gray-600">
                                Create a strong password to keep your account
                                secure
                              </p>
                            </div>

                            <form
                              onSubmit={handlePasswordSubmit}
                              className="space-y-6"
                            >
                              {/* Current Password */}
                              <div className="group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                                  <FaLock className="text-violet-600 text-sm" />
                                  Current Password
                                </label>
                                <div className="relative">
                                  <input
                                    type={
                                      showCurrentPassword ? "text" : "password"
                                    }
                                    value={passwordForm.currentPassword}
                                    onChange={(e) =>
                                      handlePasswordChange(
                                        "currentPassword",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-4 py-3 pr-14 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg group-hover:shadow-xl text-lg placeholder-gray-400"
                                    placeholder="Enter your current password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowCurrentPassword(
                                        !showCurrentPassword
                                      )
                                    }
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-violet-600 transition-colors p-2 rounded-lg hover:bg-violet-50"
                                  >
                                    {showCurrentPassword ? (
                                      <FaEyeSlash className="text-xl" />
                                    ) : (
                                      <FaEye className="text-xl" />
                                    )}
                                  </button>
                                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/0 via-violet-400/0 to-violet-400/0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                                {passwordErrors.currentPassword && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-3 flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-200"
                                  >
                                    <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                                    {passwordErrors.currentPassword}
                                  </motion.p>
                                )}
                              </div>

                              {/* New Password */}
                              <div className="group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                                  <FaLock className="text-violet-600 text-sm" />
                                  New Password
                                </label>
                                <div className="relative">
                                  <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordForm.newPassword}
                                    onChange={(e) =>
                                      handlePasswordChange(
                                        "newPassword",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-4 py-3 pr-14 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg group-hover:shadow-xl text-lg placeholder-gray-400"
                                    placeholder="Create a strong password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowNewPassword(!showNewPassword)
                                    }
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-violet-600 transition-colors p-2 rounded-lg hover:bg-violet-50"
                                  >
                                    {showNewPassword ? (
                                      <FaEyeSlash className="text-xl" />
                                    ) : (
                                      <FaEye className="text-xl" />
                                    )}
                                  </button>
                                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/0 via-violet-400/0 to-violet-400/0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                </div>

                                {/* Enhanced Password Strength Indicator */}
                                {passwordForm.newPassword && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border-2 border-violet-100 shadow-lg"
                                  >
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <FaLock className="text-white text-sm" />
                                      </div>
                                      <div>
                                        <span className="text-lg font-bold text-gray-700">
                                          Password Strength:
                                        </span>
                                        <span
                                          className={`ml-1 text-lg font-bold ${
                                            passwordStrength.score < 2
                                              ? "text-red-500"
                                              : passwordStrength.score < 4
                                              ? "text-yellow-500"
                                              : "text-green-500"
                                          }`}
                                        >
                                          {passwordStrength.score < 2
                                            ? " Weak"
                                            : passwordStrength.score < 4
                                            ? "Medium"
                                            : "Strong"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Enhanced Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4 shadow-inner">
                                      <div
                                        className={`h-2 rounded-full transition-all duration-500 shadow-lg ${
                                          passwordStrength.score < 2
                                            ? "bg-gradient-to-r from-red-400 to-red-500 w-1/4"
                                            : passwordStrength.score < 4
                                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 w-3/4"
                                            : "bg-gradient-to-r from-green-400 to-emerald-500 w-full"
                                        }`}
                                      ></div>
                                    </div>

                                    {/* Enhanced Password Requirements Checklist */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                                          passwordStrength.checks.length
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}
                                      >
                                        <div
                                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                            passwordStrength.checks.length
                                              ? "bg-green-500"
                                              : "bg-gray-300"
                                          }`}
                                        >
                                          <FaCheck className="text-white text-xs" />
                                        </div>
                                        <span className="font-medium">
                                          At least 8 characters
                                        </span>
                                      </div>
                                      <div
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                                          passwordStrength.checks.lowercase
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}
                                      >
                                        <div
                                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                            passwordStrength.checks.lowercase
                                              ? "bg-green-500"
                                              : "bg-gray-300"
                                          }`}
                                        >
                                          <FaCheck className="text-white text-xs" />
                                        </div>
                                        <span className="font-medium">
                                          Lowercase (a-z)
                                        </span>
                                      </div>
                                      <div
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                                          passwordStrength.checks.uppercase
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}
                                      >
                                        <div
                                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                            passwordStrength.checks.uppercase
                                              ? "bg-green-500"
                                              : "bg-gray-300"
                                          }`}
                                        >
                                          <FaCheck className="text-white text-xs" />
                                        </div>
                                        <span className="font-medium">
                                          Uppercase (A-Z)
                                        </span>
                                      </div>
                                      <div
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                                          passwordStrength.checks.number
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}
                                      >
                                        <div
                                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                            passwordStrength.checks.number
                                              ? "bg-green-500"
                                              : "bg-gray-300"
                                          }`}
                                        >
                                          <FaCheck className="text-white text-xs" />
                                        </div>
                                        <span className="font-medium">
                                          Number (0-9)
                                        </span>
                                      </div>
                                      <div
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 col-span-1 sm:col-span-2 ${
                                          passwordStrength.checks.special
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}
                                      >
                                        <div
                                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                            passwordStrength.checks.special
                                              ? "bg-green-500"
                                              : "bg-gray-300"
                                          }`}
                                        >
                                          <FaCheck className="text-white text-xs" />
                                        </div>
                                        <span className="font-medium">
                                          Special character (!@#$...)
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {passwordErrors.newPassword && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-3 flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-200"
                                  >
                                    <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                                    {passwordErrors.newPassword}
                                  </motion.p>
                                )}
                              </div>

                              {/* Confirm Password */}
                              <div className="group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                                  <FaLock className="text-violet-600 text-sm" />
                                  Confirm New Password
                                </label>
                                <div className="relative">
                                  <input
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) =>
                                      handlePasswordChange(
                                        "confirmPassword",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-4 py-3 pr-14 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg group-hover:shadow-xl text-lg placeholder-gray-400"
                                    placeholder="Confirm your new password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-violet-600 transition-colors p-2 rounded-lg hover:bg-violet-50"
                                  >
                                    {showConfirmPassword ? (
                                      <FaEyeSlash className="text-xl" />
                                    ) : (
                                      <FaEye className="text-xl" />
                                    )}
                                  </button>
                                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/0 via-violet-400/0 to-violet-400/0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                                </div>

                                {/* Password Match Indicator */}
                                {passwordForm.confirmPassword &&
                                  passwordForm.newPassword && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="mt-3"
                                    >
                                      {passwordForm.newPassword ===
                                      passwordForm.confirmPassword ? (
                                        <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <FaCheck className="text-white text-sm" />
                                          </div>
                                          <p className="text-green-700 font-semibold">
                                            ✅ Passwords match perfectly!
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                            <FaExclamationTriangle className="text-white text-sm" />
                                          </div>
                                          <p className="text-red-700 font-semibold">
                                            ❌ Passwords do not match
                                          </p>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}

                                {passwordErrors.confirmPassword && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm mt-3 flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-200"
                                  >
                                    <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                                    {passwordErrors.confirmPassword}
                                  </motion.p>
                                )}
                              </div>

                              {/* Enhanced Action Buttons */}
                              <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                  type="submit"
                                  disabled={
                                    passwordStrength.score < 3 ||
                                    passwordForm.newPassword !==
                                      passwordForm.confirmPassword ||
                                    !passwordForm.currentPassword
                                  }
                                  className="flex-1 relative overflow-hidden px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center gap-3 cursor-pointer"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                                  <FaLock className="text-lg relative z-10" />
                                  <span className="text-lg relative z-10">
                                    Update Password
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowChangePassword(false);
                                    setPasswordForm({
                                      currentPassword: "",
                                      newPassword: "",
                                      confirmPassword: "",
                                    });
                                    setPasswordErrors({
                                      currentPassword: "",
                                      newPassword: "",
                                      confirmPassword: "",
                                    });
                                    setPasswordStrength({
                                      score: 0,
                                      checks: {
                                        length: false,
                                        lowercase: false,
                                        uppercase: false,
                                        number: false,
                                        special: false,
                                      },
                                    });
                                  }}
                                  className="px-7 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <FaTimes className="text-lg" />
                                  <span className="text-lg">Cancel</span>
                                </button>
                              </div>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
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
                        {...editProfileFormik.getFieldProps(
                          "socialLinks.github"
                        )}
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
    </div>
  );
};

export default Profile;
