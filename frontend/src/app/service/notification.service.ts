import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { url } from '../config';
import { AppNotification, NotificationPreferences } from '../model/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = url;

  constructor(private http: HttpClient) {}

  getNotifications(userId: string): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}notifications/${userId}`);
  }

  markRead(id: string): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.apiUrl}notifications/${id}/read`, {});
  }

  retry(id: string): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${this.apiUrl}notifications/${id}/retry`, {});
  }

  getPreferences(userId: string): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}notification-preferences/${userId}`);
  }

  updatePreferences(userId: string, preferences: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.apiUrl}notification-preferences/${userId}`, preferences);
  }
}
