export type NotificationChannel = 'inApp' | 'email' | 'push';

export interface NotificationDelivery {
  channel: NotificationChannel;
  status: 'queued' | 'sent' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  error?: string;
}

export interface AppNotification {
  _id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  locale: string;
  channels: NotificationChannel[];
  delivery: NotificationDelivery[];
  readAt?: string;
  createdAt?: string;
}

export interface NotificationPreferences {
  userId: string;
  locale: string;
  promotionalEnabled: boolean;
  preferredChannels: Record<NotificationChannel, boolean>;
}
