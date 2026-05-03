interface WithdrawStepProps {
  address: string;
  amount: string;
  onAddressChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onPaste: () => void;
  onContinue: () => void;
}

export default function WithdrawStep({
  address,
  amount,
  onAddressChange,
  onAmountChange,
  onPaste,
  onContinue,
}: WithdrawStepProps) {
  return (
    <div className="flex flex-col flex-1 px-5 gap-5 overflow-y-auto">
      {/* Address input */}
      <div className="flex items-center bg-app-card rounded-3xl px-5 h-[53px] gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Address name"
          className="flex-1 bg-transparent font-outfit text-[18px] text-white placeholder-white outline-none"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onPaste}
            className="font-outfit text-[13px] text-app-green"
          >
            Paste
          </button>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 16V20H21V16" stroke="#40FF96" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
            <path d="M3 8V4H21V8" stroke="#40FF96" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
            <path d="M3 12H21" stroke="#40FF96" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Info text */}
      <p className="font-outfit text-[12px] text-white leading-[18px]">
        The withdrawal process is automatic. Usually, it takes anywhere from 10 minutes to 2-3 hours. However, as a maximum, it can take up to 7 days. The bot needs to close all active trades in order to withdraw the money.
      </p>

      {/* Amount input */}
      <div
        className="flex items-center px-5 h-[53px] rounded-3xl gap-2"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.20)",
          background: "rgba(255, 255, 255, 0.09)",
        }}
      >
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0"
          className="flex-1 min-w-0 bg-transparent font-outfit text-[18px] font-medium text-app-green tracking-[0.18px] outline-none appearance-none"
          style={{ MozAppearance: "textfield" } as React.CSSProperties}
        />
        <span className="font-outfit text-[13px] text-white flex-shrink-0">USDT</span>
      </div>

      {/* Balance info */}
      <div className="flex flex-col items-end gap-[9px]">
        <p className="font-outfit text-right w-full">
          <span className="text-[15px] text-white">Current balance: </span>
          <span className="text-[15px] text-white font-bold">725.62 </span>
          <span className="text-[12px] text-white">USDT</span>
        </p>
        <p className="font-outfit text-right w-full">
          <span className="text-[15px] text-white">Available for withdrawal*: </span>
          <span className="text-[15px] text-white font-bold">653.06 </span>
          <span className="text-[12px] text-white">USDT</span>
        </p>
        <p className="font-outfit text-[12px] text-white text-right leading-[18px] max-w-[268px] self-end">
          *The commission is charged from the remaining balance. We charge a 10% fee on withdrawals.
        </p>
      </div>

      {/* Spacer to push button down */}
      <div className="flex-1" />

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="w-full h-[52px] rounded-[54px] bg-app-green font-outfit text-[16px] text-[#191919] flex items-center justify-center"
      >
        Continue
      </button>
    </div>
  );
}
