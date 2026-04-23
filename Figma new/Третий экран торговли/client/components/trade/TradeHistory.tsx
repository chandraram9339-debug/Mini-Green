type TradeType = "new" | "successful" | "unsuccessful";

interface TradeItem {
  id: string;
  type: TradeType;
  timestamp: string;
  price?: string;
  pair?: string;
  direction?: "up" | "down";
  targetPrice?: string;
  profit?: string;
  loss?: string;
}

const trades: TradeItem[] = [
  {
    id: "1",
    type: "new",
    timestamp: "31.12.2024 00:00",
    price: "69 425.22",
    pair: "USDT/BTC",
  },
  {
    id: "2",
    type: "successful",
    timestamp: "31.12.2024 00:00",
    direction: "down",
    targetPrice: "69569.32",
    pair: "USDT/BTC",
    profit: "0.13 %",
  },
  {
    id: "3",
    type: "unsuccessful",
    timestamp: "31.12.2024 00:00",
    direction: "up",
    targetPrice: "69569.32",
    pair: "USDT/BTC",
    loss: "0.16 %",
  },
];

function NewTradeItem({ item }: { item: TradeItem }) {
  return (
    <div className="bg-white rounded-xl px-3 py-4 flex flex-col gap-2.5 relative">
      {/* Timestamp */}
      <span className="absolute top-3 right-3 text-bot-grey-medium font-outfit text-[10px] uppercase">
        {item.timestamp}
      </span>

      {/* Title Row */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-bot-grey-light -rotate-90">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.40234 13.6668V3" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            <path d="M3.40234 3H8.73576L9.36322 4.25492H13.4417V11.157H9.36322L8.73576 9.90207H3.40234" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-bot-black font-outfit text-lg font-medium">Opening new trade...</span>
      </div>

      {/* Price Row */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6" />
        <span className="text-bot-grey-dark font-outfit text-base">Actual price:</span>
        <div className="flex items-end gap-1">
          <span className="text-bot-black font-outfit text-base font-medium">{item.price}</span>
          <span className="text-bot-grey-dark font-outfit text-[9px] pb-0.5">{item.pair}</span>
        </div>
      </div>
    </div>
  );
}

function SuccessfulTradeItem({ item }: { item: TradeItem }) {
  return (
    <div className="bg-white rounded-xl px-3 py-4 flex flex-col gap-3 relative">
      {/* Timestamp */}
      <span className="absolute top-3 right-3 text-bot-grey-medium font-outfit text-[10px] uppercase">
        {item.timestamp}
      </span>

      {/* Title Row */}
      <div className="flex items-center gap-2.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" transform="matrix(0 1 1 0 0 0)" fill="#73C1B1"/>
          <path d="M8 11.5L11 14.5L17 8.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="text-bot-black font-outfit text-lg font-medium tracking-wide">
          Prediction was successful!
        </span>
      </div>

      {/* Price Row */}
      <div className="flex items-center gap-2.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5.43431 6.56569L4.86863 6L6 4.86863L6.56569 5.43431L6 6L5.43431 6.56569ZM6 6L6.56569 5.43431L18.5657 17.4343L18 18L17.4343 18.5657L5.43431 6.56569L6 6Z" fill="#DF7F7F"/>
          <path d="M9 18H18V9" stroke="#DF7F7F" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="text-bot-grey-dark font-outfit text-base">
          Price is {item.direction === "down" ? "DOWN" : "UP"}
        </span>
        <div className="flex items-end gap-1">
          <span className="text-bot-black font-outfit text-base font-medium">to {item.targetPrice}</span>
          <span className="text-bot-grey-dark font-outfit text-[9px] pb-0.5">{item.pair}</span>
        </div>
      </div>

      {/* Profit Row */}
      <div className="flex items-center gap-2.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 17L9 11L13 15L21 7" stroke="#8494AF" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M21 14V7H14" stroke="#8494AF" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="text-bot-grey-dark font-outfit text-base">Profit of trade is:</span>
        <span className="text-bot-black font-outfit text-base">{item.profit}</span>
      </div>
    </div>
  );
}

function UnsuccessfulTradeItem({ item }: { item: TradeItem }) {
  return (
    <div className="bg-white rounded-xl px-3 py-4 flex flex-col gap-3 relative">
      {/* Timestamp */}
      <span className="absolute top-3 right-3 text-bot-grey-medium font-outfit text-[10px] uppercase">
        {item.timestamp}
      </span>

      {/* Title Row */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-bot-red -rotate-90">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4.5 4.5L11.5 11.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            <path d="M4.5 11.5L11.5 4.49999" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-bot-black font-outfit text-lg font-medium tracking-wide">
          Prediction was unsuccessful.
        </span>
      </div>

      {/* Price Row */}
      <div className="flex items-center gap-2.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5.43431 17.4343L4.86863 18L6 19.1314L6.56569 18.5657L6 18L5.43431 17.4343ZM6 18L6.56569 18.5657L18.5657 6.56569L18 6L17.4343 5.43431L5.43431 17.4343L6 18Z" fill="#759AC6"/>
          <path d="M9 6H18V15" stroke="#759AC6" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="text-bot-grey-dark font-outfit text-base">
          Price is {item.direction === "up" ? "UP" : "DOWN"}
        </span>
        <div className="flex items-end gap-1">
          <span className="text-bot-black font-outfit text-base font-medium">to {item.targetPrice}</span>
          <span className="text-bot-grey-dark font-outfit text-[9px] pb-0.5">{item.pair}</span>
        </div>
      </div>

      {/* Loss Row */}
      <div className="flex items-center gap-2.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 17L9 11L13 15L21 7" stroke="#DF7F7F" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M21 14V7H14" stroke="#DF7F7F" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        <span className="text-bot-grey-dark font-outfit text-base">Loss of trade is:</span>
        <span className="text-bot-black font-outfit text-base">{item.loss}</span>
      </div>
    </div>
  );
}

export default function TradeHistory() {
  return (
    <div className="px-4 pt-6 pb-2">
      {/* Section Title */}
      <h2 className="text-bot-black font-outfit text-xl font-medium tracking-wide mb-4">
        trading:
      </h2>

      {/* Trade List */}
      <div className="flex flex-col gap-2.5">
        {trades.map((trade) => {
          if (trade.type === "new") return <NewTradeItem key={trade.id} item={trade} />;
          if (trade.type === "successful") return <SuccessfulTradeItem key={trade.id} item={trade} />;
          if (trade.type === "unsuccessful") return <UnsuccessfulTradeItem key={trade.id} item={trade} />;
          return null;
        })}
      </div>
    </div>
  );
}
