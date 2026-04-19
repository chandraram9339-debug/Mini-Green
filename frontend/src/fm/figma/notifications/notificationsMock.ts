/** Заглушка до API — экран «1 | Notification» (node 1:3770). */

export type NotificationItem = {
  id: string;
  variant: "success" | "error";
  message: string;
  date: string;
};

/** Порядок и тексты как в Figma: блок из 3 карточек → разделитель → блок из 2. */
export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    variant: "success",
    message: "Withdrawal of 99 USDT completed.",
    date: "31.12.2024 00:00",
  },
  {
    id: "2",
    variant: "error",
    message: "Check your wallet address and try again.",
    date: "31.12.2024 00:00",
  },
  {
    id: "3",
    variant: "success",
    message: "Withdrawal of 99 USDT completed.",
    date: "31.12.2024 00:00",
  },
  {
    id: "4",
    variant: "error",
    message: "Check your wallet address and try again.",
    date: "31.12.2024 00:00",
  },
  {
    id: "5",
    variant: "success",
    message: "Withdrawal of 99 USDT completed.",
    date: "31.12.2024 00:00",
  },
];
