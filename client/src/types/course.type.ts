export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  originalPrice: number;
  discountPrice?: number;
  isFree: boolean;
  currentPrice?: number;
  rating: number;
  ratingsCount: number;
  studentsEnrolled: string[];
  enrollmentCount: number;
  image: string;
  videoPromo?: string;
  tags: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  sections: Section[];
  learningObjectives: string[];
  requirements: string[];
  targetAudience: string[];
  totalDuration: number;
  totalLessons: number;
  certificateProvided: boolean;
  isPublished: boolean;
  publishedAt?: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  reviews: {
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  progress?: {
    user: string;
    completedLessons: string[];
    progressPercentage: number;
    lastAccessedLesson?: string;
    enrollmentDate: string;
  }[];
}

export interface Lesson {
  id: string;
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number; // in seconds
  order: number;
  isPreview: boolean;
  course: string;
  section: string;
  resources: {
    name: string;
    url: string;
    type: "pdf" | "zip" | "doc" | "other";
  }[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  course: string;
  lessons: Lesson[];
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseQuery {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  instructor?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "rating" | "originalPrice" | "createdAt" | "studentsCount";
  sortOrder?: "asc" | "desc";
}

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  originalPrice: number;
  discountPrice?: number;
  isFree?: boolean;
  image?: string;
  videoPromo?: string;
  tags?: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  language?: string;
  learningObjectives?: string[];
  requirements?: string[];
  targetAudience?: string[];
  certificateProvided?: boolean;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  isPublished?: boolean;
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CourseResponse {
  success: boolean;
  data: Course;
}

export interface CourseListResponse {
  success: boolean;
  data: Course[];
}

export interface CourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  tags: string[];

  learningObjectives: string[];
  requirements: string[];
  targetAudience: string[];
  level: "Beginner" | "Intermediate" | "Advanced";

  originalPrice: number;
  discountPrice: number;
  isFree: boolean;
  language: string;
  certificateProvided: boolean;

  image: File | null;
  videoPromo: File | null;

  sections: {
    title: string;
    description?: string;
    order: number;
    course: string;
    lessons: {
      title: string;
      description?: string;
      videoUrl: string;
      duration: number;
      order: number;
      isPreview: boolean;
      course: string;
      section: string;
      resources: {
        name: string;
        url: string;
        type: "pdf" | "zip" | "doc" | "other";
      }[];
      quiz: {
        question: string;
        options: string[];
        correctAnswer: number;
      }[];
    }[];
  }[];
}
