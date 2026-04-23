import AppBar from "@/components/trade/AppBar";
import BotStatus from "@/components/trade/BotStatus";
import TabBar from "@/components/trade/TabBar";
import TradeHistory from "@/components/trade/TradeHistory";
import TradingStats from "@/components/trade/TradingStats";
import { useState } from "react";

export default function Index() {
  const [activeTab, setActiveTab] = useState<"home" | "wallet" | "bot" | "support">("bot");

  return (
    <div className="min-h-screen bg-bot-bg overflow-x-hidden">
      {/* Centered container for web view */}
      <div className="w-full max-w-[500px] mx-auto relative min-h-screen flex flex-col">
        {/* Sticky App Bar */}
        <AppBar notificationCount={25} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-28">
          <BotStatus
            isActive={true}
            price="69 425.22"
            pair="USDT/BTC"
          />

          <TradingStats />

          <TradeHistory />

          {/* Bottom padding for safety */}
          <div className="h-4" />
        </main>

        {/* Fixed Tab Bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
