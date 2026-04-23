export default function BalanceSection() {
  return (
    <div className="w-full px-4 pt-6 pb-5">
      {/* Balance info */}
      <div className="flex flex-col items-center gap-1 mb-6">
        <span className="text-wallet-black font-outfit font-medium text-xl tracking-[0.4px]">
          Current balance
        </span>

        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-wallet-black font-outfit font-semibold text-[52px] leading-none">
            8725.62
          </span>
          <span className="text-wallet-grey-medium font-outfit font-normal text-xs leading-none self-end mb-1">
            USDT
          </span>
        </div>

        <span className="text-wallet-grey-dark font-inter font-normal text-[11px] mt-1">
          TQBw8SGT.......6l48HPv4iB
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {/* Top up button */}
        <button className="flex-1 flex items-center justify-center gap-2 bg-wallet-green rounded-[54px] py-[14px] px-5 h-[52px]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M12 6V18"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
            <path
              d="M6 12H18"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-white font-outfit font-normal text-base">
            Top up
          </span>
        </button>

        {/* Withdraw button */}
        <button className="flex-1 flex items-center justify-center gap-2 bg-wallet-blue-light rounded-[54px] py-[14px] px-5 h-[52px]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M11.35 18V18.65H12.65V18H12H11.35ZM12 18H12.65V6H12H11.35V18H12Z"
              fill="white"
            />
            <path
              d="M7.5 10.5L12 6L16.5 10.5"
              stroke="white"
              strokeWidth="1.3"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-white font-outfit font-normal text-base">
            Withdraw
          </span>
        </button>
      </div>
    </div>
  );
}
