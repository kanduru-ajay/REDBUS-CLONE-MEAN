import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { url } from '../config';
import { ReviewSummary, RouteReview } from '../model/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private http: HttpClient) {}

  getReviews(routeName = ''): Observable<ReviewSummary> {
    const params = routeName ? new HttpParams().set('routeName', routeName) : undefined;
    return this.http.get<ReviewSummary>(`${url}reviews`, { params });
  }

  createReview(payload: Partial<RouteReview>): Observable<RouteReview> {
    return this.http.post<RouteReview>(`${url}reviews`, payload);
  }

  updateReview(id: string, payload: Partial<RouteReview>): Observable<RouteReview> {
    return this.http.patch<RouteReview>(`${url}reviews/${id}`, payload);
  }

  reportReview(id: string, userId: string, reason: string): Observable<RouteReview> {
    return this.http.post<RouteReview>(`${url}reviews/${id}/report`, { userId, reason });
  }
}
