import type { NotificationPreferences } from "../types";
import { readJSON, writeJSON } from "../lib/storage";

/** Production would store preferences server-side and send email via a provider. */
export interface NotificationService {
  savePreferences(input: NotificationPreferences): Promise<void>;
  getPreferences(setId: string): Promise<NotificationPreferences | null>;
}

export interface QueuedEmail {
  id: string;
  to: string;
  subject: string;
  at: string;
}

export class MockNotificationService implements NotificationService {
  constructor(private userId: string) {}

  async savePreferences(input: NotificationPreferences): Promise<void> {
    writeJSON(`notify:${this.userId}:${input.setId}`, input);
  }

  async getPreferences(setId: string): Promise<NotificationPreferences | null> {
    return this.getSync(setId);
  }

  getSync(setId: string): NotificationPreferences | null {
    return readJSON<NotificationPreferences | null>(`notify:${this.userId}:${setId}`, null);
  }

  queueSync(): QueuedEmail[] {
    return readJSON<QueuedEmail[]>(`outbox:${this.userId}`, []);
  }

  enqueue(mail: QueuedEmail) {
    const q = this.queueSync();
    q.unshift(mail);
    writeJSON(`outbox:${this.userId}`, q.slice(0, 20));
  }
}
