interface DepositItem {
  id: number;
  amount: string;
  commission: string;
  address: string;
  date: string;
}

const deposits: DepositItem[] = [
  {
    id: 1,
    amount: "+1200.00",
    commission: "-163.00",
    address: "TQBw8....SGTF",
    date: "20.06.2025 13:05",
  },
  {
    id: 2,
    amount: "+2340.00",
    commission: "-311.20",
    address: "TfcD....jbTa",
    date: "05.06.2025 15:10",
  },
  {
    id: 3,
    amount: "+1037.00",
    commission: "-141.81",
    address: "TNem....ZncP",
    date: "15.05.2025 14:52",
  },
  {
    id: 4,
    amount: "+560.00",
    commission: "-79.80",
    address: "TSd5f....x9bc",
    date: "14.05.2025 09:20",
  },
  {
    id: 5,
    amount: "+100.00",
    commission: "-20.00",
    address: "T7pZ....YicH",
    date: "10.05.2025 13:21",
  },
];

function DepositIcon() {
  return (
    <div className="w-6 h-6 rounded-[30px] bg-wallet-green flex items-center justify-center shrink-0 self-start mt-0.5">
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
        <path
          d="M8 12L8 4"
          stroke="white"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function DepositList() {
  return (
    <div className="flex flex-col gap-[9px] overflow-x-hidden">
      {deposits.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-2.5 bg-white rounded-xl px-2.5 py-4"
        >
          <DepositIcon />

          {/* Left: title + subtitle */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-wallet-black font-outfit font-medium text-lg leading-tight tracking-[0.18px]">
              Replenishment
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
