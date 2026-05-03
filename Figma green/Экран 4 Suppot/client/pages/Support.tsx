import AppBar from "@/components/AppBar";
import BottomNav from "@/components/BottomNav";

const SupportChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="white"/>
    <path d="M8 11H8.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11H12.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 11H16.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FaqIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 8C8 7.204 8.369 6.441 9.025 5.879C9.681 5.316 10.572 5 11.5 5H12.5C13.428 5 14.319 5.316 14.975 5.879C15.63 6.44 16 7.204 16 8C16.0368 8.64925 15.8617 9.2929 15.501 9.83398C15.1402 10.3751 14.6135 10.7843 14 11C13.386 11.288 12.86 11.833 12.499 12.555C12.1303 13.3153 11.9588 14.1561 12 15" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19V19.01" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface ListItemProps {
  icon: React.ReactNode;
  label: string;
  dimmed?: boolean;
}

function ListItem({ icon, label, dimmed }: ListItemProps) {
  return (
    <button
      className="flex w-full items-center gap-2 px-2.5 py-3 rounded-3xl transition-opacity hover:opacity-80 active:opacity-60"
      style={{ background: "#131413" }}
      onClick={() => {}}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span
        className="font-medium text-lg tracking-tight"
        style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: 18,
          letterSpacing: "0.18px",
          color: dimmed ? "rgba(255, 255, 255, 0.5)" : "#FFFFFF",
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function Support() {
  return (
    <div
      className="min-h-dvh w-full flex flex-col"
      style={{ background: "#0A0A0A", fontFamily: "Outfit, sans-serif" }}
    >
      <div className="w-full max-w-[430px] mx-auto flex flex-col min-h-dvh relative">
        {/* Status Bar spacer */}
        <div className="h-11" />

        {/* App Bar */}
        <AppBar title="Social Media" notificationCount={25} />

        {/* Content */}
        <div className="flex-1 px-5 pt-6 pb-32">
          <div className="flex flex-col gap-2.5">
            <ListItem icon={<SupportChatIcon />} label="Support Chat" />
            <ListItem icon={<FaqIcon />} label="FAQ" dimmed />
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
