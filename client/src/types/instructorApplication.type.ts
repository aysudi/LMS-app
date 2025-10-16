export interface InstructorApplication {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio: string;
  expertise: string[];
  experience: string;
  education: string;
  motivation: string;
  sampleCourseTitle?: string;
  sampleCourseDescription?: string;
  portfolio?: string;
  linkedIn?: string;
  website?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  adminFeedback?: string;
  rejectionReason?: string;
}

export interface InstructorApplicationsResponse {
  success: boolean;
  data: {
    applications: InstructorApplication[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalApplications: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface InstructorApplicationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio: string;
  expertise: string[];
  experience: string;
  education: string;
  motivation: string;
  sampleCourseTitle?: string;
  sampleCourseDescription?: string;
  portfolio?: string;
  linkedIn?: string;
  website?: string;
}

export interface ApplicationStatusUpdate {
  applicationId: string;
  adminFeedback?: string;
  rejectionReason?: string;
}

export const EXPERTISE_OPTIONS = [
  "Web Development",
  "Mobile App Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Digital Marketing",
  "Graphic Design",
  "UI/UX Design",
  "Photography",
  "Video Editing",
  "Music Production",
  "Writing & Content Creation",
  "Business Strategy",
  "Project Management",
  "Finance & Accounting",
  "Language Learning",
  "Fitness & Health",
  "Cooking & Culinary Arts",
  "Personal Development",
  "Software Engineering",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "Game Development",
  "Animation",
  "3D Modeling",
  "Other",
];

export const APPLICATION_STATUS_COLORS = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    icon: "text-yellow-500",
  },
  approved: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    icon: "text-green-500",
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    icon: "text-red-500",
  },
};
