import AppHeader from "@/components/AppHeader";
import PriceChart from "@/components/PriceChart";
import BotStatus from "@/components/BotStatus";
import ActionButtons from "@/components/ActionButtons";
import BottomNav from "@/components/BottomNav";

export default function Index() {
  return (
    <div className="min-h-screen bg-brand-dark flex justify-center items-start">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-brand-dark overflow-hidden">
        <AppHeader />
        <div className="flex-1 px-5 overflow-y-auto">
          <PriceChart />
          <BotStatus />
          <ActionButtons />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
