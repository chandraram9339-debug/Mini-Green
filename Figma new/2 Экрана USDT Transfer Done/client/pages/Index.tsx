import StatusBar from "@/components/StatusBar";
import AppBar from "@/components/AppBar";
import TransactionList from "@/components/TransactionList";
import DoneStatus from "@/components/DoneStatus";
import TabBar from "@/components/TabBar";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 sm:p-8">
      {/* Phone frame wrapper — centers on desktop, fills on mobile */}
      <div className="relative w-full max-w-[390px] bg-app-bg flex flex-col overflow-hidden rounded-[40px] shadow-2xl"
        style={{ minHeight: "min(824px, 100vh)", maxHeight: "min(824px, 100svh)" }}>

        {/* Status bar */}
        <StatusBar />

        {/* App bar */}
        <AppBar title="USDT Transfer" />

        {/* Main content area */}
        <div className="flex flex-col flex-1 px-5 pt-5">
          {/* Transaction details list */}
          <TransactionList
            recipient="UQC4...754C"
            amount={150}
            commission={15}
            currency="USDT"
          />

          {/* Spacer to push Done to the lower area */}
          <div className="flex-1" />

          {/* Done status */}
          <div className="flex justify-center pb-8">
            <DoneStatus />
          </div>
        </div>

        {/* Tab bar */}
        <TabBar activeTab="wallet" />
      </div>
    </div>
  );
}
