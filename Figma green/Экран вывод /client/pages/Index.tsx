import { useState } from "react";
import StatusBar from "@/components/withdraw/StatusBar";
import AppBar from "@/components/withdraw/AppBar";
import TabBar from "@/components/withdraw/TabBar";
import WithdrawStep from "@/components/withdraw/WithdrawStep";
import ConfirmStep from "@/components/withdraw/ConfirmStep";
import DoneStep from "@/components/withdraw/DoneStep";

type Step = "withdraw" | "confirm" | "done";

const COMMISSION_RATE = 0.1;

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function Index() {
  const [step, setStep] = useState<Step>("withdraw");
  const [address, setAddress] = useState("UQC4A4C7E8F3B2D1A9D5E6F7B8C9D0E1F2A3B4C5D6E7F8754C");
  const [amount, setAmount] = useState("150");

  const commission = (parseFloat(amount || "0") * COMMISSION_RATE).toFixed(0);
  const displayAddress = truncateAddress(address);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch {
      // clipboard not accessible
    }
  };

  const handleBack = () => {
    if (step === "confirm") setStep("withdraw");
    else if (step === "done") setStep("confirm");
  };

  const handleClose = () => {
    setStep("withdraw");
    setAddress("");
    setAmount("");
  };

  const appBarTitle =
    step === "withdraw" ? "Withdraw" : "USDT Transfer";

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-outfit">
      <div
        className="relative flex flex-col bg-app-bg overflow-hidden w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-[748px] sm:rounded-[48px]"
      >
        {/* Status Bar */}
        <StatusBar />

        {/* App Bar */}
        <AppBar
          title={appBarTitle}
          onBack={handleBack}
          onClose={handleClose}
        />

        {/* Content */}
        <div className="flex flex-col flex-1 py-5 min-h-0">
          {step === "withdraw" && (
            <WithdrawStep
              address={address}
              amount={amount}
              onAddressChange={setAddress}
              onAmountChange={setAmount}
              onPaste={handlePaste}
              onContinue={() => setStep("confirm")}
            />
          )}

          {step === "confirm" && (
            <ConfirmStep
              recipient={displayAddress}
              amount={amount}
              commission={commission}
              onConfirm={() => setStep("done")}
            />
          )}

          {step === "done" && (
            <DoneStep
              recipient={displayAddress}
              amount={amount}
              commission={commission}
            />
          )}
        </div>

        {/* Tab Bar */}
        <TabBar />
      </div>
    </div>
  );
}
