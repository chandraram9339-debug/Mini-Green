import { useState } from "react";

type TimeFrame = "24h" | "3d" | "7d" | "1m";

interface StatsData {
  totalDeals: number;
  successful: number;
  unsuccessful: number;
  profitPercentage: string;
}

const statsData: Record<TimeFrame, StatsData> = {
  "24h": { totalDeals: 78, successful: 39, unsuccessful: 39, profitPercentage: "-0.72 %" },
  "3d":  { totalDeals: 214, successful: 118, unsuccessful: 96, profitPercentage: "+1.43 %" },
  "7d":  { totalDeals: 490, successful: 261, unsuccessful: 229, profitPercentage: "+3.21 %" },
  "1m":  { totalDeals: 2100, successful: 1134, unsuccessful: 966, profitPercentage: "+8.56 %" },
};

export default function TradingStats() {
  const [activeTab, setActiveTab] = useState<TimeFrame>("24h");
  const stats = statsData[activeTab];

  return (
    <div className="px-4 pt-6 pb-2">
      {/* Section Title */}
      <h2 className="text-bot-black font-outfit text-xl font-medium tracking-wide mb-4">
        Trading bot statistics for the period:
      </h2>

      {/* Time Frame Tabs */}
      <div className="flex justify-between gap-2 mb-4">
        {(["24h", "3d", "7d", "1m"] as TimeFrame[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg font-outfit text-lg font-medium tracking-wide transition-colors ${
              activeTab === tab
                ? "bg-white text-bot-blue shadow-sm"
                : "bg-[#F4F7F8] text-bot-blue"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl p-4 mb-4 flex flex-col gap-3">
        {/* Total Deals */}
        <div className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15" stroke="#759AC6" strokeWidth="1.6"/>
            <path d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z" stroke="#759AC6" strokeWidth="1.6"/>
            <path d="M12 16.0001L13 21.0001H14L17 18.0001V12.1001" stroke="#759AC6" strokeWidth="1.6"/>
            <path d="M8 12L3 11V10L6 7H11.9" stroke="#759AC6" strokeWidth="1.6"/>
          </svg>
          <span className="text-bot-grey-dark font-outfit text-base">Total deals:</span>
          <span className="text-bot-black font-outfit text-base font-medium">{stats.totalDeals}</span>
        </div>

        {/* Successful */}
        <div className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12L10 17L20 7" stroke="#73C1B1" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
          <span className="text-bot-grey-dark font-outfit text-base">Successful:</span>
          <span className="text-bot-black font-outfit text-base font-medium">{stats.successful}</span>
        </div>

        {/* Unsuccessful */}
        <div className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#unsucc-clip)">
              <path d="M5.5 5.5L18.5 18.5" stroke="#DF7F7F" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M5.5 18.5L18.5 5.49999" stroke="#DF7F7F" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="unsucc-clip"><rect width="24" height="24" fill="white"/></clipPath>
            </defs>
          </svg>
          <span className="text-bot-grey-dark font-outfit text-base">Unsuccessful:</span>
          <span className="text-bot-black font-outfit text-base font-medium">{stats.unsuccessful}</span>
        </div>

        {/* Profit Percentage */}
        <div className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 17L9 11L13 15L21 7" stroke="#8494AF" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M21 14V7H14" stroke="#8494AF" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
          <span className="text-bot-grey-dark font-outfit text-base">Percentage of profit:</span>
          <span className="text-bot-black font-outfit text-base font-medium">{stats.profitPercentage}</span>
        </div>
      </div>

      {/* Chart */}
      <TradingChart />
    </div>
  );
}

function TradingChart() {
  return (
    <div className="w-full overflow-hidden">
      {/* Scale + Chart */}
      <div className="flex flex-col w-full">
        {/* Scale lines */}
        {["7.00%", "6.00%", "5.00%", "4.00%", "3.00%", "2.00%", "1.00%", "0.00%", "-1.00%", "-2.00%"].map(
          (label) => (
            <div key={label} className="flex items-center gap-1 pb-3.5">
              <span className="text-bot-grey-medium font-outfit text-[6px] w-[20px] text-right shrink-0">
                {label}
              </span>
              <div className="flex-1 h-px bg-bot-grey-line" />
            </div>
          )
        )}
      </div>

      {/* Chart SVG - positioned relative to scales */}
      <div className="relative -mt-[168px] ml-6 mr-0">
        <svg
          viewBox="0 0 325 122"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGrad" x1="162.5" y1="0" x2="162.5" y2="122" gradientUnits="userSpaceOnUse">
              <stop stopColor="#759AC6" stopOpacity="0.5"/>
              <stop offset="1" stopColor="#ECF1F4" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path
            d="M3.19408 51.3435L0 42.4209V122H325V10.8609H301.843L293.858 2.74937L288.268 18.1612L280.283 23.0281V16.5389L276.29 19.7835L273.894 7.61626L271.499 10.8609L269.103 5.99397L265.111 13.2943L261.916 9.23856L255.528 14.9166L253.931 13.2943L249.939 19.7835L246.744 14.9166L243.55 23.0281L241.953 18.1612L238.759 23.0281L234.767 16.5389L232.371 23.0281H222.789L214.803 16.5389L212.408 19.7835L210.012 16.5389L206.02 21.4058L203.624 18.1612L202.027 19.7835L198.034 16.5389L195.639 18.9724L192.644 5.99397L189.251 8.42741L187.554 0L184.459 56.2104L181.538 27.5555L178.071 54.5881L174.877 50.0286V54.5881V60.2662L170.884 61.8885L170.086 70L166.892 60.2662L165.295 57.0216L162.899 59.455V54.5881H159.705L158.108 60.2662H154.115L151.72 63.5108L150.123 59.455L147.727 63.5108L144.533 54.5881L140.541 57.0216L138.145 51.3435L136.548 57.0216L134.152 51.3435L132.555 63.5108L129.361 57.0216L126.966 68.3777L124.57 63.5108L121.376 60.2662L117.383 59.455L110.995 52.1547L111.794 60.2662L107.801 59.455L104.607 65.1331L95.0246 67.5665L89.4349 59.455L85.4422 68.3777L83.8452 57.8327L82.2482 66.7554L79.0541 51.3435L74.2629 59.455L68.6732 44.0432L65.4791 52.9658L63.0835 45.6655L56.6953 51.3435L53.5012 47.2878L50.3071 49.7212L47.9115 45.6655L42.3218 51.3435L35.1351 45.6655L29.5455 54.5881L26.3513 48.0989L21.5602 54.5881L19.1646 47.2878L15.9705 51.3435L13.5749 44.0432L11.9779 49.7212L9.5823 52.9658L3.19408 51.3435Z"
            fill="url(#chartGrad)"
          />
          <path
            d="M0 42.4209L3.19408 51.3435L9.58231 52.9658L11.9779 49.7212L13.5749 44.0432L15.9705 51.3435L19.1646 47.2878L21.5602 54.5881L26.3513 48.0989L29.5455 54.5881L35.1351 45.6655L42.3218 51.3435L47.9115 45.6655L50.3071 49.7212L53.5012 47.2878L56.6953 51.3435L63.0835 45.6655L65.4791 52.9658L68.6732 44.0432L74.2629 59.455L79.0541 51.3435L82.2482 66.7554L83.8452 57.8327L85.4422 68.3777L89.4349 59.455L95.0246 67.5665L104.607 65.1331L107.801 59.455L111.794 60.2662L110.995 52.1547L117.383 59.455L121.376 60.2662L124.57 63.5108L126.966 68.3777L129.361 57.0216L132.555 63.5108L134.152 51.3435L136.548 57.0216L138.145 51.3435L140.541 57.0216L144.533 54.5881L147.727 63.5108L150.123 59.455L151.72 63.5108L154.115 60.2662H158.108L159.705 54.5881H162.899V59.455L165.295 57.0216L166.892 60.2662L170.086 70L170.884 61.8885L174.877 60.2662V54.5881V50.0286L178.071 54.5881L181.538 27.5555L184.459 56.2104L187.554 0L189.251 8.42741L192.644 5.99397L195.639 18.9724L198.034 16.5389L202.027 19.7835L203.624 18.1612L206.02 21.4058L210.012 16.5389L212.408 19.7835L214.803 16.5389L222.789 23.0281H232.371L234.767 16.5389L238.759 23.0281L241.953 18.1612L243.55 23.0281L246.744 14.9166L249.939 19.7835L253.931 13.2943L255.528 14.9166L261.916 9.23856L265.111 13.2943L269.103 5.99397L271.499 10.8609L273.894 7.61626L276.29 19.7835L280.283 16.5389V23.0281L288.268 18.1612L293.858 2.74937L301.843 10.8609H325"
            stroke="#55647B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
