 import { Component, OnInit } from '@angular/core';
import { Booking } from '../../model/booking.model';
import { ReviewSummary, RouteReview } from '../../model/review.model';
import { BusService } from '../../service/bus.service';
import { ReviewService } from '../../service/review.service';

@Component({
  selector: 'app-reviews-page',
  templateUrl: './reviews-page.component.html',
  styleUrl: './reviews-page.component.css',
})
export class ReviewsPageComponent implements OnInit {
  bookings: Booking[] = [];
  selectedBookingId = '';
  rating = 5;
  content = '';
  summary: ReviewSummary = { averageRating: 0, reviews: [] };
  message = '';
  error = '';
  isLoading = true;

  constructor(private busService: BusService, private reviewService: ReviewService) {}

  ngOnInit(): void {
    const user = this.currentUser;
    if (!user?._id) {
      this.error = 'Sign in to review completed journeys.';
      this.isLoading = false;
      this.loadReviews();
      return;
    }
    this.busService.getbusmongo(user._id).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.selectedBookingId = bookings[0]?._id || bookings[0]?.id || '';
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load completed journeys.';
        this.isLoading = false;
      },
    });
    this.loadReviews();
  }

  get currentUser(): { _id?: string; name?: string } | null {
    const rawUser = sessionStorage.getItem('Loggedinuser');
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as { _id?: string; name?: string };
    } catch {
      return null;
    }
  }

  loadReviews(): void {
    this.reviewService.getReviews().subscribe({
      next: (summary) => (this.summary = summary),
    });
  }

  submitReview(): void {
    const user = this.currentUser;
    if (!user?._id) {
      this.error = 'Only verified users can review journeys.';
      return;
    }
    if (this.content.trim().length < 20) {
      this.error = 'Review must be at least 20 characters.';
      return;
    }
    this.reviewService
      .createReview({
        userId: user._id,
        userName: user.name || 'Verified traveler',
        bookingId: this.selectedBookingId,
        rating: this.rating,
        content: this.content,
      })
      .subscribe({
        next: () => {
          this.message = 'Review published.';
          this.error = '';
          this.content = '';
          this.loadReviews();
        },
        error: (error) => (this.error = error?.error?.error || 'Unable to publish review.'),
      });
  }

  report(review: RouteReview): void {
    const userId = this.currentUser?._id;
    if (!review._id || !userId) return;
    this.reviewService.reportReview(review._id, userId, 'Inappropriate review').subscribe({
      next: () => (this.message = 'Review reported for moderation.'),
    });
  }
}
