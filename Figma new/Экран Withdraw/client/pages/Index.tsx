import { useState } from "react";
import AppBar from "@/components/AppBar";
import TabBar from "@/components/TabBar";

export default function WithdrawScreen() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("150");

  const currentBalance = 725.62;
  const availableBalance = 653.06;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#ECF1F4] flex items-center justify-center">
      {/* Mobile-centric container, centered on desktop */}
      <div className="w-full max-w-[500px] h-[100dvh] flex flex-col bg-[#ECF1F4] overflow-hidden">
        {/* App Bar with status bar */}
        <AppBar title="Withdraw" />

        {/* Scrollable content area */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Form section */}
          <div className="flex flex-col gap-0 px-5 pt-5">
            {/* Address input */}
            <div className="flex items-center gap-2 bg-[#E3E6EB] rounded-xl px-5 py-[15px] h-[53px]">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address name"
                className="flex-1 bg-transparent outline-none text-[#55647B] text-lg font-outfit placeholder:text-[#55647B] min-w-0"
              />
              {/* Scan icon */}
              <button className="flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 16V20H21V16" stroke="#759AC6" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
                  <path d="M3 8V4H21V8" stroke="#759AC6" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
                  <path d="M3 12H21" stroke="#759AC6" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Paste */}
              <button
                onClick={handlePaste}
                className="flex-shrink-0 text-[#759AC6] text-[13px] font-outfit"
              >
                Paste
              </button>
            </div>

            {/* Withdrawal info text */}
            <p className="text-[#8494AF] text-[12px] font-outfit leading-[18px] mt-[14px]">
              The withdrawal process is automatic. Usually, it takes anywhere from 10 minutes to 2-3 hours. However, as a maximum, it can take up to 7 days. The bot needs to close all active trades in order to withdraw the money.
            </p>

            {/* Amount input */}
            <div className="flex items-center gap-2 bg-[#E3E6EB] rounded-xl px-5 py-[15px] h-[53px] mt-[18px]">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent outline-none text-[#192B48] text-lg font-medium tracking-[0.18px] font-outfit placeholder:text-[#8494AF] min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[#759AC6] text-[13px] font-outfit flex-shrink-0">USDT</span>
            </div>

            {/* Balance info */}
            <div className="flex flex-col items-end gap-[9px] mt-[20px]">
              <p className="text-[#8494AF] text-right font-outfit">
                <span className="text-[15px] font-normal">Current balance: </span>
                <span className="text-[15px] font-bold">{currentBalance.toFixed(2)} </span>
                <span className="text-[12px] font-normal">USDT</span>
              </p>
              <p className="text-[#8494AF] text-right font-outfit">
                <span className="text-[15px] font-normal">Available for withdrawal*: </span>
                <span className="text-[15px] font-bold">{availableBalance.toFixed(2)} </span>
                <span className="text-[12px] font-normal">USDT</span>
              </p>
              <p className="text-[#8494AF] text-[12px] font-outfit leading-[18px] text-right max-w-[268px]">
                *The commission is charged from the remaining balance. We charge a 10% fee on withdrawals.
              </p>
            </div>
          </div>

          {/* Bottom section: Continue button + TabBar */}
          <div className="flex flex-col">
            {/* Continue button */}
            <div className="px-5 pb-4">
              <button className="w-full bg-[#2D6E93] rounded-[54px] py-4 flex items-center justify-center h-[52px]">
                <span className="text-white text-[16px] font-outfit">Continue</span>
              </button>
            </div>

            {/* Tab Bar */}
            <TabBar activeTab="wallet" />
          </div>
        </div>
      </div>
    </div>
  );
}
