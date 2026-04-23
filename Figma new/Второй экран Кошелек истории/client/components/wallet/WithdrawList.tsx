interface WithdrawItem {
  id: number;
  amount: string;
  commission: string;
  address: string;
  date: string;
}

const withdrawals: WithdrawItem[] = [
  {
    id: 1,
    amount: "-1500.00",
    commission: "-45.00",
    address: "TQBw8....SGTF",
    date: "18.06.2025 10:30",
  },
  {
    id: 2,
    amount: "-900.98",
    commission: "-27.03",
    address: "TfcD....jbTa",
    date: "12.06.2025 08:15",
  },
  {
    id: 3,
    amount: "-1200.00",
    commission: "-36.00",
    address: "TNem....ZncP",
    date: "02.06.2025 17:44",
  },
  {
    id: 4,
    amount: "-650.00",
    commission: "-19.50",
    address: "T7pZ....YicH",
    date: "28.05.2025 12:00",
  },
];

function WithdrawIcon() {
  return (
    <div className="w-6 h-6 rounded-[30px] bg-wallet-blue-light flex items-center justify-center shrink-0 self-start mt-0.5">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 8L12 8"
          stroke="white"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function WithdrawList() {
  return (
    <div className="flex flex-col gap-[9px] overflow-x-hidden">
      {withdrawals.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-2.5 bg-white rounded-xl px-2.5 py-4"
        >
          <WithdrawIcon />

          {/* Left: title + subtitle */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-wallet-black font-outfit font-medium text-lg leading-tight tracking-[0.18px]">
              Withdrawal
            </span>
            <span className="text-wallet-grey-medium font-outfit font-normal text-[13px] leading-tight">
              Commission
            </span>
            <span className="text-wallet-grey-medium font-outfit font-normal text-[13px] leading-tight truncate">
              {item.address}
            </span>
          </div>

          {/* Right: amounts + date */}
          <div className="flex flex-col items-end gap-[13px] shrink-0 pt-[3px]">
            <div className="flex items-baseline gap-1">
              <span className="text-wallet-black font-outfit font-medium text-base leading-none text-right">
                {item.amount}
              </span>
              <span className="text-wallet-grey-medium font-outfit font-normal text-[9px] leading-none">
                USDT
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-wallet-grey-medium font-outfit font-medium text-[13px] leading-none text-right">
                {item.commission}
              </span>
              <span className="text-wallet-grey-medium font-outfit font-normal text-[9px] leading-none">
                USDT
              </span>
            </div>

            <span className="text-wallet-grey-medium font-outfit font-normal text-[10px] uppercase leading-none text-right mt-1">
              {item.date}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
