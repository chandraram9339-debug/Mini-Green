export type TabType = "deposit" | "withdraw" | "referral";

interface SummaryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabConfig {
  id: TabType;
  title: string;
  totalLabel: string;
  totalValue: string;
  countLabel: string;
  countValue: string;
  countUnit: string;
}

const TABS: TabConfig[] = [
  {
    id: "deposit",
    title: "Deposit",
    totalLabel: "Total deposited amount:",
    totalValue: "5237.00",
    countLabel: "Number of deposits made:",
    countValue: "5",
    countUnit: "Times",
  },
  {
    id: "withdraw",
    title: "Withdraw",
    totalLabel: "Total withdrawal amount:",
    totalValue: "4250.98",
    countLabel: "Number of withdrawals:",
    countValue: "4",
    countUnit: "Times",
  },
  {
    id: "referral",
    title: "Refferal",
    totalLabel: "Bonuses received from:",
    totalValue: "603.22",
    countLabel: "Total number of invited users:",
    countValue: "8",
    countUnit: "People",
  },
];

// Arrow UP icon (active state)
function ArrowUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 13.3332V13.8332H8.5V13.3332H8H7.5ZM8 13.3332H8.5V2.6665H8H7.5L7.5 13.3332H8Z"
        fill="white"
      />
      <path
        d="M4 6.6665L8 2.6665L12 6.6665"
        stroke="white"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Arrow DOWN icon (inactive state)
function ArrowDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 2.66683V2.16683H7.5V2.66683H8H8.5ZM8 2.66683H7.5L7.5 13.3335H8H8.5L8.5 2.66683H8Z"
        fill="white"
      />
      <path
        d="M12 9.3335L8 13.3335L4 9.3335"
        stroke="white"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface TabCardProps {
  config: TabConfig;
  isActive: boolean;
  onClick: () => void;
}

function TabCard({ config, isActive, onClick }: TabCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg p-2.5 relative flex flex-col justify-between min-h-[137px] text-left transition-colors ${
        isActive ? "bg-white shadow-sm" : "bg-wallet-inactive"
      }`}
    >
      {/* Title */}
      <div className="flex flex-col gap-0">
        <span
          className={`font-outfit text-wallet-blue text-[17px] leading-tight tracking-[0.18px] ${
            isActive ? "font-normal" : "font-medium"
          }`}
        >
          {config.title}
        </span>

        {/* Total amount */}
        <div className="mt-[14px] flex flex-col gap-0.5">
          <span className="text-wallet-grey-dark font-outfit text-[8px] font-normal leading-tight">
            {config.totalLabel}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-wallet-black font-outfit font-medium text-base leading-none">
              {config.totalValue}
            </span>
            <span className="text-wallet-grey-medium font-outfit font-normal text-[9px] leading-none">
              USDT
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: count + arrow button */}
      <div className="flex items-end justify-between mt-3">
        <div className="flex flex-col gap-1">
          <span className="text-wallet-grey-dark font-outfit text-[8px] font-normal leading-tight max-w-[57px]">
            {config.countLabel}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-wallet-black font-outfit font-normal text-xs leading-none">
              {config.countValue}
            </span>
            <span className="text-wallet-grey-medium font-outfit font-normal text-[6px] uppercase leading-none">
              {config.countUnit}
            </span>
          </div>
        </div>

        {/* Arrow indicator button */}
        {isActive ? (
          <div className="w-7 h-7 rounded-[30px] bg-wallet-green-light flex items-center justify-center shrink-0">
            <ArrowUpIcon />
          </div>
        ) : (
          <div
            className="w-7 h-7 rounded-[20px] bg-wallet-blue flex items-center justify-center shrink-0"
            style={{ transform: "rotate(90deg)" }}
          >
            <ArrowDownIcon />
          </div>
        )}
      </div>
    </button>
  );
}

export default function SummaryTabs({ activeTab, onTabChange }: SummaryTabsProps) {
  return (
    <div className="flex gap-[13px]">
      {TABS.map((tab) => (
        <TabCard
          key={tab.id}
          config={tab}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  );
}
