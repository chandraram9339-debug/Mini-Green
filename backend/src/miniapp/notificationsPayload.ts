import type { Database } from "better-sqlite3";
import {
  countUnreadUserNotifications,
  listUserNotifications,
  type UserNotificationRow,
} from "../repos/notificationRepo.js";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatNotificationDate(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "—";
  return `${pad2(dt.getUTCDate())}.${pad2(dt.getUTCMonth() + 1)}.${dt.getUTCFullYear()} ${pad2(dt.getUTCHours())}:${pad2(dt.getUTCMinutes())}`;
}

function toItem(row: UserNotificationRow) {
  return {
    id: row.id,
    kind: row.kind,
    variant: row.variant,
    message: row.message,
    date: formatNotificationDate(row.created_at),
  };
}

export function buildNotificationsPayload(db: Database, userId: number, limit: number) {
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit || 20)));
  return {
    items: listUserNotifications(db, userId, safeLimit).map(toItem),
    unreadCount: countUnreadUserNotifications(db, userId),
  };
}
