import { Component, OnInit } from '@angular/core';
import { AppNotification, NotificationPreferences } from '../../model/notification.model';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.css',
})
export class NotificationsPageComponent implements OnInit {
  notifications: AppNotification[] = [];
  preferences: NotificationPreferences | null = null;
  isLoading = true;
  message = '';
  error = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  get userId(): string {
    const rawUser = sessionStorage.getItem('Loggedinuser');
    if (!rawUser) return '';
    try {
      return JSON.parse(rawUser)._id || '';
    } catch {
      return '';
    }
  }

  load(): void {
    if (!this.userId) {
      this.isLoading = false;
      this.error = 'Sign in to manage notification history and preferences.';
      return;
    }
    this.isLoading = true;
    this.notificationService.getNotifications(this.userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load notifications.';
        this.isLoading = false;
      },
    });
    this.notificationService.getPreferences(this.userId).subscribe({
      next: (preferences) => (this.preferences = preferences),
    });
  }

  savePreferences(): void {
    if (!this.preferences || !this.userId) return;
    this.notificationService.updatePreferences(this.userId, this.preferences).subscribe({
      next: (preferences) => {
        this.preferences = preferences;
        this.message = 'Notification preferences saved.';
      },
      error: () => (this.error = 'Unable to save notification preferences.'),
    });
  }

  markRead(notification: AppNotification): void {
    if (!notification._id) return;
    this.notificationService.markRead(notification._id).subscribe({
      next: (updated) => (this.notifications = this.notifications.map((item) => (item._id === updated._id ? updated : item))),
    });
  }

  retry(notification: AppNotification): void {
    if (!notification._id) return;
    this.notificationService.retry(notification._id).subscribe({
      next: (updated) => {
        this.notifications = this.notifications.map((item) => (item._id === updated._id ? updated : item));
        this.message = 'Delivery retry scheduled.';
      },
      error: () => (this.error = 'Retry failed.'),
    });
  }

  unreadCount(): number {
    return this.notifications.filter((notification) => !notification.readAt).length;
  }
}
