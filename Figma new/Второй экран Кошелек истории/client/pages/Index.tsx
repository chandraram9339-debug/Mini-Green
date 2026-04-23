import { useState } from "react";
import AppBar from "@/components/wallet/AppBar";
import BalanceSection from "@/components/wallet/BalanceSection";
import SummaryTabs, { TabType } from "@/components/wallet/SummaryTabs";
import DepositList from "@/components/wallet/DepositList";
import WithdrawList from "@/components/wallet/WithdrawList";
import ReferralList from "@/components/wallet/ReferralList";
import BottomTabBar from "@/components/wallet/BottomTabBar";

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>("deposit");

  return (
    <div
      className="min-h-screen bg-wallet-bg font-outfit overflow-x-hidden"
      style={{ overflowX: "hidden" }}
    >
      <div className="w-full max-w-[430px] mx-auto flex flex-col pb-[88px]">
        {/* App Bar */}
        <AppBar />

        {/* Balance Section */}
        <BalanceSection />

        {/* Tabs + History */}
        <div className="px-4 flex flex-col gap-[13px]">
          {/* Summary tab cards */}
          <SummaryTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Transaction history list */}
          <div className="overflow-x-hidden">
            {activeTab === "deposit" && <DepositList />}
            {activeTab === "withdraw" && <WithdrawList />}
            {activeTab === "referral" && <ReferralList />}
          </div>
        </div>
      </div>

      {/* Fixed bottom navigation */}
      <BottomTabBar />
    </div>
  );
}
