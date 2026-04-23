import { useState } from "react";

const WALLET_ADDRESS = "UQC46p7nqqFwihInvN0kdCv0RCVe3QumHDv86OkX12NN754C";

export function DepositContent() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WALLET_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[30px] px-5 overflow-hidden">
      {/* Title */}
      <h2 className="text-[#192B48] text-xl font-medium font-outfit text-center">
        Recieve USDT
      </h2>

      {/* QR Code */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/671bb49541f1e420a15c3f921f49b3160059c018?width=400"
        alt="QR Code"
        className="w-[200px] h-[200px] object-contain"
      />

      {/* Wallet Address Card */}
      <div className="w-full bg-white rounded-xl px-5 py-[15px] flex items-center justify-center">
        <p className="text-[#192B48] text-lg font-normal font-outfit text-center leading-snug break-all">
          {WALLET_ADDRESS}
        </p>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 bg-[#E3E6EB] rounded-[54px] px-5 py-[14px] transition-opacity active:opacity-80"
      >
        {copied ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12L10 17L20 7" stroke="#55647B" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H16V21H3V8Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 8V3H21V16H16" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <span className="text-[#55647B] text-base font-normal font-outfit">
          {copied ? 'Copied!' : 'Copy'}
        </span>
      </button>

      {/* Paid Button */}
      <button className="w-full flex items-center justify-center gap-2 bg-[#2D6E93] rounded-[54px] px-5 py-[14px] transition-opacity active:opacity-80">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12L10 17L20 7" stroke="white" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="text-white text-base font-normal font-outfit">Paid</span>
      </button>
    </div>
  );
}
