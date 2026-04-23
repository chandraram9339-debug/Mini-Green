import PerformanceChart from "./PerformanceChart";

export default function BotStatusSection() {
  return (
    <section className="w-full px-4 pt-5 font-outfit">
      {/* Chart */}
      <PerformanceChart />

      {/* Status + Price row */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Bot Status */}
        <div className="flex items-center gap-5">
          <span className="text-brand-grey-medium text-[13px] font-normal">
            Bot status
          </span>
          <div className="flex items-center gap-1.5">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="5" cy="5" r="5" fill="#73C1B1" />
            </svg>
            <span className="text-brand-green text-xl font-normal">Active</span>
          </div>
        </div>

        {/* Actual Price */}
        <div className="flex items-end gap-1.5">
          <span className="text-brand-grey-medium text-[13px] font-normal">
            Actual price
          </span>
          <div className="flex items-start gap-1">
            <span className="text-brand-black text-xl font-medium leading-none">
              69 425.22
            </span>
            <span className="text-brand-grey-dark text-[9px] font-normal mt-1">
              USDT/BTC
            </span>
          </div>
        </div>
      </div>

      {/* Details button for bot section */}
      <button className="w-full flex items-center justify-center gap-2 bg-brand-blue-dark rounded-full py-3.5 hover:opacity-90 transition-opacity">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 4V20H20"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
          <path
            d="M9 13L13 9L16 12L20 8"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-white font-outfit text-base font-normal">
          Details
        </span>
      </button>
    </section>
  );
}
