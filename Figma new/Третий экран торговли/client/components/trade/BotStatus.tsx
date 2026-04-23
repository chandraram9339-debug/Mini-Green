interface BotStatusProps {
  isActive?: boolean;
  price?: string;
  pair?: string;
  onStart?: () => void;
  onStop?: () => void;
}

export default function BotStatus({
  isActive = true,
  price = "69 425.22",
  pair = "USDT/BTC",
  onStart,
  onStop,
}: BotStatusProps) {
  return (
    <div className="px-4 pt-6 pb-2">
      {/* Status Row */}
      <div className="flex flex-col gap-1 mb-8">
        {/* Bot Status */}
        <div className="flex items-center gap-5">
          <span className="text-bot-grey-medium font-outfit text-[13px]">Bot status</span>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-bot-green" : "bg-bot-red"}`}
            />
            <span
              className={`font-outfit text-xl font-normal ${isActive ? "text-bot-green" : "text-bot-red"}`}
            >
              {isActive ? "Active" : "Stopped"}
            </span>
          </div>
        </div>

        {/* Price Row */}
        <div className="flex items-end gap-1.5 mt-1">
          <span className="text-bot-grey-medium font-outfit text-[13px] leading-none pb-0.5">
            Actual price
          </span>
          <div className="flex items-end gap-1">
            <span className="text-bot-black font-outfit text-xl font-medium leading-none">
              {price}
            </span>
            <span className="text-bot-grey-dark font-outfit text-[9px] leading-none pb-0.5">
              {pair}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Start Button */}
        <button
          onClick={onStart}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-bot-blue text-white font-outfit text-base transition-opacity hover:opacity-90 active:opacity-80"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15" stroke="white" strokeWidth="1.6"/>
            <path d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z" stroke="white" strokeWidth="1.6"/>
            <path d="M12 16.0001L13 21.0001H14L17 18.0001V12.1001" stroke="white" strokeWidth="1.6"/>
            <path d="M8 12L3 11V10L6 7H11.9" stroke="white" strokeWidth="1.6"/>
          </svg>
          <span>Start</span>
        </button>

        {/* Stop Button */}
        <button
          onClick={onStop}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-bot-red text-white font-outfit text-base transition-opacity hover:opacity-90 active:opacity-80"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#stop-clip)">
              <path d="M5.5 5.5L18.5 18.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M5.5 18.5L18.5 5.49999" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="stop-clip">
                <rect width="24" height="24" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
}
