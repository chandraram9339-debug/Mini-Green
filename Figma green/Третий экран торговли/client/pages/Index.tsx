import BotHeader from "@/components/BotHeader";
import BotChart from "@/components/BotChart";
import StatsTabs from "@/components/StatsTabs";
import StatsCard from "@/components/StatsCard";
import TradeHistory from "@/components/TradeHistory";
import BottomNav from "@/components/BottomNav";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-outfit flex justify-center">
      {/* Mobile container — max 430px centered */}
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-28">
          {/* Header with green background */}
          <BotHeader />

          {/* Chart section */}
          <BotChart />

          {/* Stats period tabs + title */}
          <StatsTabs activeTab="24h" />

          {/* Statistics card */}
          <StatsCard />

          {/* Trade history */}
          <div className="mt-5">
            <TradeHistory />
          </div>
        </div>

        {/* Bottom glow decoration */}
        <div
          className="pointer-events-none absolute bottom-[88px] left-1/2 -translate-x-1/2"
          style={{
            width: 322,
            height: 35,
            background: "rgba(64,255,150,0.32)",
            filter: "blur(32.5px)",
            borderRadius: "50%",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-[96px] right-[60px]"
          style={{
            width: 66,
            height: 9,
            background: "#40FF96",
            filter: "blur(15px)",
            borderRadius: "50%",
          }}
        />

        {/* Bottom nav fixed inside container */}
        <div className="absolute bottom-0 left-0 right-0 pb-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pt-6">
          <BottomNav active="bot" />
        </div>
      </div>
    </div>
  );
}
