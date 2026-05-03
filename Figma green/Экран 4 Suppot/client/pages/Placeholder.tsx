import AppBar from "@/components/AppBar";
import BottomNav from "@/components/BottomNav";

interface PlaceholderProps {
  title: string;
}

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <div
      className="min-h-dvh w-full flex flex-col"
      style={{ background: "#0A0A0A", fontFamily: "Outfit, sans-serif" }}
    >
      <div className="w-full max-w-[430px] mx-auto flex flex-col min-h-dvh relative">
        {/* Status Bar spacer */}
        <div className="h-11" />

        {/* App Bar */}
        <AppBar title={title} notificationCount={25} />

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-32 gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(64, 255, 150, 0.12)" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#40FF96" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#40FF96" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#40FF96" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p
            className="text-center text-sm"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Outfit, sans-serif" }}
          >
            This page is coming soon.{"\n"}Continue prompting to fill in the content.
          </p>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
