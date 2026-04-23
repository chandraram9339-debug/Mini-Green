import { useState } from "react";
import AppBar from "@/components/AppBar";
import BalanceSection from "@/components/BalanceSection";
import BotStatusSection from "@/components/BotStatusSection";
import ActionButtons from "@/components/ActionButtons";
import TabBar from "@/components/TabBar";

type Tab = "home" | "wallet" | "bot" | "support";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  return (
    <div className="flex flex-col min-h-screen w-full tg-bg overflow-x-hidden font-outfit">
      {/* Fixed header */}
      <AppBar />

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-2">
        <BalanceSection />
        <BotStatusSection />
        <ActionButtons />
      </main>

      {/* Fixed bottom tab bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
