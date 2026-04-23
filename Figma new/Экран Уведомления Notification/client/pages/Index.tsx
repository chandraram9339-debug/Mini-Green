import StatusBar from "@/components/StatusBar";
import AppBar from "@/components/AppBar";
import TabBar from "@/components/TabBar";
import NotificationItem from "@/components/NotificationItem";

const notificationsGroup1 = [
  {
    id: 1,
    type: "successful" as const,
    description: "Withdrawal of 99 USDT completed.",
    timestamp: "31.12.2024 00:00",
  },
  {
    id: 2,
    type: "unsuccessful" as const,
    description: "Check your wallet address and try again.",
    timestamp: "31.12.2024 00:00",
  },
  {
    id: 3,
    type: "successful" as const,
    description: "Withdrawal of 99 USDT completed.",
    timestamp: "31.12.2024 00:00",
  },
];

const notificationsGroup2 = [
  {
    id: 4,
    type: "unsuccessful" as const,
    description: "Check your wallet address and try again.",
    timestamp: "31.12.2024 00:00",
  },
  {
    id: 5,
    type: "successful" as const,
    description: "Withdrawal of 99 USDT completed.",
    timestamp: "31.12.2024 00:00",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-app-bg flex items-start justify-center font-outfit">
      {/* Mobile phone shell — centered on larger screens */}
      <div className="w-full max-w-[390px] min-h-screen flex flex-col bg-app-bg">
        {/* Status Bar */}
        <StatusBar />

        {/* App Bar */}
        <AppBar title="Notification" notificationCount={3} />

        {/* Scrollable notification list */}
        <div className="flex-1 overflow-y-auto px-5 pt-[18px] pb-4 flex flex-col gap-[30px]">
          {/* Group 1 */}
          <div className="flex flex-col gap-[9px]">
            {notificationsGroup1.map((item) => (
              <NotificationItem
                key={item.id}
                type={item.type}
                description={item.description}
                timestamp={item.timestamp}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-app-line" />

          {/* Group 2 */}
          <div className="flex flex-col gap-[9px]">
            {notificationsGroup2.map((item) => (
              <NotificationItem
                key={item.id}
                type={item.type}
                description={item.description}
                timestamp={item.timestamp}
              />
            ))}
          </div>
        </div>

        {/* Tab Bar */}
        <TabBar activeTab="support" />
      </div>
    </div>
  );
}
