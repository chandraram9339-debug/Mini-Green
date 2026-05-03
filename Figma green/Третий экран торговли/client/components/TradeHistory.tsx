function NewTradeCard() {
  return (
    <div className="mx-5 rounded-3xl bg-[#131413] px-[10px] py-4 flex flex-col gap-[10px]">
      {/* Title */}
      <div className="flex items-center gap-[10px]">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FF7B2A] flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.40234 13.6668V3" stroke="#131413" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            <path d="M3.40234 3H8.73576L9.36322 4.25492H13.4417V11.157H9.36322L8.73576 9.90207H3.40234" stroke="#131413" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-outfit text-white text-lg font-medium">Opening new trade...</span>
      </div>
      {/* Description */}
      <div className="flex items-center gap-[10px]">
        <div className="w-6 h-6 flex-shrink-0" />
        <span className="font-outfit text-white text-base font-normal">Actual price:</span>
        <div className="flex items-end gap-1">
          <span className="font-outfit text-white text-base font-medium">69 425.22</span>
          <span className="font-outfit text-white text-[9px] font-normal mb-[2px]">USDT/BTC</span>
        </div>
      </div>
    </div>
  );
}

function SuccessfulTradeCard() {
  return (
    <div className="mx-5 rounded-3xl bg-[#131413] px-[10px] py-4 flex flex-col gap-3">
      {/* Title */}
      <div className="flex items-center gap-[10px]">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(64,255,150,0.25)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 7.5L7 10.5L13 4.5" stroke="#40FF96" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-outfit text-white text-lg font-medium tracking-[0.18px]">Prediction was successful!</span>
      </div>
      {/* Price row */}
      <div className="flex items-center gap-[10px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M5.43431 6.56569L4.86863 6L6 4.86863L6.56569 5.43431L6 6L5.43431 6.56569ZM6 6L6.56569 5.43431L18.5657 17.4343L18 18L17.4343 18.5657L5.43431 6.56569L6 6Z" fill="#FF0000"/>
          <path d="M9 18H18V9" stroke="#FF0000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="font-outfit text-white text-base font-normal">Price is DOWN</span>
        <div className="flex items-end gap-1">
          <span className="font-outfit text-white text-base font-medium">to 69569.32</span>
          <span className="font-outfit text-white text-[9px] font-normal mb-[2px]">USDT/BTC</span>
        </div>
      </div>
      {/* Profit row */}
      <div className="flex items-center gap-[10px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M3 17L9 11L13 15L21 7" stroke="#40FF96" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M21 14V7H14" stroke="#40FF96" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="font-outfit text-white text-base font-normal">Profit of trade is:</span>
        <span className="font-outfit text-white text-base font-normal">0.13 %</span>
      </div>
    </div>
  );
}

function UnsuccessfulTradeCard() {
  return (
    <div className="mx-5 rounded-3xl bg-[#131413] px-[10px] py-4 flex flex-col gap-3">
      {/* Title */}
      <div className="flex items-center gap-[10px]">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 -rotate-90" style={{ background: "rgba(223,127,127,0.25)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4.5 4.5L11.5 11.5" stroke="#FF0000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            <path d="M4.5 11.5L11.5 4.49999" stroke="#FF0000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-outfit text-white text-lg font-medium tracking-[0.18px]">Prediction was unsuccessful.</span>
      </div>
      {/* Price row */}
      <div className="flex items-center gap-[10px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M5.43431 17.4343L4.86863 18L6 19.1314L6.56569 18.5657L6 18L5.43431 17.4343ZM6 18L6.56569 18.5657L18.5657 6.56569L18 6L17.4343 5.43431L5.43431 17.4343L6 18Z" fill="#40FF96"/>
          <path d="M9 6H18V15" stroke="#40FF96" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="font-outfit text-white text-base font-normal">Price is UP</span>
        <div className="flex items-end gap-1">
          <span className="font-outfit text-white text-base font-medium">to 69569.32</span>
          <span className="font-outfit text-white text-[9px] font-normal mb-[2px]">USDT/BTC</span>
        </div>
      </div>
      {/* Loss row */}
      <div className="flex items-center gap-[10px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M3 17L9 11L13 15L21 7" stroke="#40FF96" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M21 14V7H14" stroke="#40FF96" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="font-outfit text-white text-base font-normal">Loss of trade is:</span>
        <span className="font-outfit text-white text-base font-normal">0.16 %</span>
      </div>
    </div>
  );
}

export default function TradeHistory() {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <h2 className="font-outfit font-medium text-white text-xl tracking-[0.4px] px-5">
        trading:
      </h2>
      <NewTradeCard />
      <SuccessfulTradeCard />
      <UnsuccessfulTradeCard />
    </div>
  );
}
