export interface Resource {
  name: string;
  url: string;
  type: "pdf" | "zip" | "doc" | "other";
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Lesson {
  _id?: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order: number;
  isPreview: boolean;
  course: string;
  section: string;
  resources: Resource[];
  quiz: QuizQuestion[];
}

export interface Section {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  course: string;
  lessons: Lesson[];
}

export interface CurriculumFormData {
  sections: Section[];
}
