export interface RouteReview {
  _id?: string;
  userId: string;
  userName: string;
  bookingId: string;
  busId: string;
  routeName: string;
  rating: number;
  content: string;
  isHidden: boolean;
  trustedReviewer: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewSummary {
  averageRating: number;
  reviews: RouteReview[];
}
