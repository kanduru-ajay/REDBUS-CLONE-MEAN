import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { url } from '../config';
import { CommunityActivity, CommunityPost } from '../model/community.model';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private apiUrl = `${url}community/`;

  constructor(private http: HttpClient) {}

  getPosts(filters: Record<string, string>): Observable<CommunityPost[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<CommunityPost[]>(`${this.apiUrl}posts`, { params }).pipe(shareReplay(1));
  }

  createPost(post: Partial<CommunityPost>): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.apiUrl}posts`, post);
  }

  toggleLike(postId: string, userId: string): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.apiUrl}posts/${postId}/like`, { userId });
  }

  addComment(postId: string, authorId: string, authorName: string, content: string): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.apiUrl}posts/${postId}/comments`, {
      authorId,
      authorName,
      content,
    });
  }

  reportPost(postId: string, userId: string, reason: string): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.apiUrl}posts/${postId}/report`, { userId, reason });
  }

  moderatePost(postId: string, status: string, adminEmail: string, adminNote: string): Observable<CommunityPost> {
    return this.http.patch<CommunityPost>(`${this.apiUrl}posts/${postId}/moderate`, {
      status,
      adminEmail,
      adminNote,
    });
  }

  getActivity(userId: string): Observable<CommunityActivity> {
    return this.http.get<CommunityActivity>(`${this.apiUrl}activity/${userId}`);
  }
}
