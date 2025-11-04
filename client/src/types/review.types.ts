export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  rating: number;
  comment: string;
  date: string;
  updatedAt?: string;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
