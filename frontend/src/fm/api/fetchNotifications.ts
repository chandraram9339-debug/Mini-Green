import { apiFetch } from "./http";

export type AppNotificationItem = {
  id: string;
  kind: "deposit" | "withdraw" | "support";
  variant: "success" | "error";
  message: string;
  date: string;
};

export type AppNotificationsPayload = {
  items: AppNotificationItem[];
  unreadCount: number;
};

export async function fetchNotifications(limit = 20): Promise<AppNotificationsPayload | null> {
  const res = await apiFetch(`/notifications?limit=${encodeURIComponent(String(limit))}`, { method: "GET" });
  if (!res.ok) return null;
  const json = (await res.json()) as Partial<AppNotificationsPayload> | null;
  return {
    items: Array.isArray(json?.items) ? (json?.items as AppNotificationItem[]) : [],
    unreadCount:
      typeof json?.unreadCount === "number" && Number.isFinite(json.unreadCount) ? json.unreadCount : 0,
  };
}

export async function markNotificationsReadAll(): Promise<boolean> {
  const res = await apiFetch("/notifications/read-all", { method: "POST" });
  return res.ok;
}
