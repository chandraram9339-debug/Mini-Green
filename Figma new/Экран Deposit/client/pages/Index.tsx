import { AppBar } from "@/components/AppBar";
import { TabBar } from "@/components/TabBar";
import { DepositContent } from "@/components/DepositContent";

export default function Index() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#ECF1F4] font-outfit w-full max-w-[500px] mx-auto">
      <AppBar title="Deposit" notificationCount={3} />
      <DepositContent />
      <TabBar activeTab="wallet" />
    </div>
  );
}
