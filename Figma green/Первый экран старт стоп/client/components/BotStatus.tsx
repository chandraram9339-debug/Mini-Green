export default function BotStatus() {
  return (
    <div className="mt-6 w-full">
      {/* Bot status row */}
      <div className="flex items-end gap-5">
        <span className="font-outfit font-normal text-[13px] text-white/50">Bot status</span>
        <div className="flex items-end gap-[6px]">
          <div className="w-[10px] h-[10px] rounded-full bg-white shrink-0 mb-[3px]" />
          <span className="font-outfit font-normal text-[20px] text-white leading-none">Active</span>
        </div>
      </div>

      {/* Price row */}
      <div className="flex items-end gap-[7px] mt-[15px]">
        <span className="font-outfit font-normal text-[13px] text-white/50">Actual price</span>
        <div className="flex items-end gap-1">
          <span className="font-outfit font-medium text-[20px] text-brand-green leading-none">
            69 425.22
          </span>
          <span className="font-outfit font-normal text-[9px] text-white leading-none mb-[3px]">
            USDT/BTC
          </span>
        </div>
      </div>
    </div>
  );
}
