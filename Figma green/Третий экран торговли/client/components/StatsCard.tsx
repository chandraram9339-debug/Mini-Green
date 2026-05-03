export default function StatsCard() {
  return (
    <div className="mx-5 mt-4 rounded-3xl bg-[#131413] px-[10px] py-4 flex flex-col gap-3">
      {/* Total deals */}
      <div className="flex items-center gap-[10px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15" stroke="#FF7B2A" strokeWidth="1.6"/>
          <path d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z" stroke="#FF7B2A" strokeWidth="1.6"/>
          <path d="M12 15.9996L13 20.9996H14L17 17.9996V12.0996" stroke="#FF7B2A" strokeWidth="1.6"/>
          <path d="M8 12L3 11V10L6 7H11.9" stroke="#FF7B2A" strokeWidth="1.6"/>
        </svg>
        <span className="font-outfit text-white text-base font-normal">Total deals:</span>
        <span className="font-outfit text-white text-base font-normal">78</span>
      </div>

      {/* Successful */}
      <div className="flex items-center gap-[10px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12L10 17L20 7" stroke="#40FF96" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="font-outfit text-white text-base font-normal">Successful:</span>
        <span className="font-outfit text-white text-base font-normal">39</span>
      </div>

      {/* Unsuccessful */}
      <div className="flex items-center gap-[10px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5.5 5.5L18.5 18.5" stroke="#FF0000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          <path d="M5.5 18.5L18.5 5.49999" stroke="#FF0000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="font-outfit text-white text-base font-normal">Unsuccessful:</span>
        <span className="font-outfit text-white text-base font-normal">39</span>
      </div>

      {/* Profit */}
      <div className="flex items-center gap-[10px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 17L9 11L13 15L21 7" stroke="#40FF96" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M21 14V7H14" stroke="#40FF96" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="font-outfit text-white text-base font-normal">Percentage of profit:</span>
        <span className="font-outfit text-white text-base font-normal">-0.72 %</span>
      </div>
    </div>
  );
}
