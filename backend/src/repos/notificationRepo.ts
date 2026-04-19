import crypto from "node:crypto";
import type { Database } from "better-sqlite3";

export type UserNotificationVariant = "success" | "error";
export type UserNotificationKind = "deposit" | "withdraw" | "support";

export type UserNotificationRow = {
  id: string;
  user_id: number;
  kind: UserNotificationKind;
  variant: UserNotificationVariant;
  message: string;
  source_id: string | null;
  unread: number;
  created_at: string;
};

export function insertUserNotification(
  db: Database,
  input: {
    user_id: number;
    kind: UserNotificationKind;
    variant: UserNotificationVariant;
    message: string;
    source_id?: string | null;
    created_at?: string;
  },
) {
  const id = `ntf_${crypto.randomUUID()}`;
  const createdAt = input.created_at ?? new Date().toISOString();
  db.prepare(
    `INSERT INTO user_notifications
      (id, user_id, kind, variant, message, source_id, unread, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
  ).run(id, input.user_id, input.kind, input.variant, input.message, input.source_id ?? null, createdAt);
  return id;
}

export function listUserNotifications(db: Database, userId: number, limit: number): UserNotificationRow[] {
  return db
    .prepare(
      `SELECT id, user_id, kind, variant, message, source_id, unread, created_at
       FROM user_notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(userId, limit) as UserNotificationRow[];
}

export function countUnreadUserNotifications(db: Database, userId: number): number {
  const row = db
    .prepare("SELECT count(*) as n FROM user_notifications WHERE user_id = ? AND unread = 1")
    .get(userId) as { n: number };
  return row.n;
}

export function markAllUserNotificationsRead(db: Database, userId: number): number {
  const result = db
    .prepare("UPDATE user_notifications SET unread = 0 WHERE user_id = ? AND unread = 1")
    .run(userId);
  return result.changes;
}
