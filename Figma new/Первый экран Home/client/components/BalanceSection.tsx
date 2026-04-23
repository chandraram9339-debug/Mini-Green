export default function BalanceSection() {
  return (
    <section className="w-full px-4 pt-6 font-outfit">
      <div className="flex items-start justify-between">
        {/* Left: Balance info */}
        <div className="flex flex-col gap-1">
          <span className="text-brand-black text-xl font-medium tracking-wide">
            Total Balance
          </span>

          {/* Large amount */}
          <div className="flex items-start gap-1 mt-2">
            <span className="text-brand-black font-outfit text-[52px] font-semibold leading-none">
              725.62
            </span>
            <span className="text-brand-grey-medium font-outfit text-xs font-normal mt-2">
              USDT
            </span>
          </div>

          {/* Divider */}
          <div className="w-44 h-px bg-brand-grey-line mt-3" />

          {/* Referrals */}
          <div className="mt-3 flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <span className="text-brand-black font-outfit text-xl font-medium leading-none">
                425.22
              </span>
              <span className="text-brand-grey-dark font-outfit text-[9px] font-normal mt-1">
                USDT
              </span>
            </div>
            <span className="text-brand-grey-dark font-inter text-[11px] font-normal">
              Received by referrals
            </span>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex flex-col gap-3 mt-1.5">
          {/* Top up */}
          <button className="flex items-center gap-3 bg-brand-green rounded-full px-6 py-2.5 hover:opacity-90 transition-opacity">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 5V15"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M5 10H15"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-white font-outfit text-xs font-normal">
              Top up
            </span>
          </button>

          {/* Withdraw */}
          <button className="flex items-center justify-center gap-1 bg-brand-blue-light rounded-full px-5 py-2.5 hover:opacity-90 transition-opacity">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.35 15V15.65H10.65V15H10H9.35ZM10 15H10.65V5H10H9.35V15H10Z"
                fill="white"
              />
              <path
                d="M6.25 8.75L10 5L13.75 8.75"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-white font-outfit text-xs font-normal">
              Withdraw
            </span>
          </button>
        </div>
      </div>

      {/* Details button */}
      <button className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-blue-dark rounded-full py-3.5 hover:opacity-90 transition-opacity">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 8H3V20H21V8Z"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 8V4H17V8"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 14H17"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
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
