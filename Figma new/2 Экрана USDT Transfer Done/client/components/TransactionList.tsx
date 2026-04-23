interface TransactionListProps {
  recipient: string;
  amount: number;
  commission: number;
  currency: string;
}

export default function TransactionList({
  recipient,
  amount,
  commission,
  currency,
}: TransactionListProps) {
  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden">
      {/* Recipient row */}
      <div className="flex items-center justify-between w-full h-[49px] bg-app-white px-5 relative">
        <span className="text-app-grey-dark text-[15px] font-normal font-outfit">
          Recipient
        </span>
        <span className="text-app-black text-[18px] font-medium font-outfit">
          {recipient}
        </span>
        <div className="absolute bottom-0 left-5 right-5 h-px bg-app-grey-line" />
      </div>

      {/* Amount row */}
      <div className="flex items-center justify-between w-full h-[49px] bg-app-white px-5 relative">
        <span className="text-app-grey-dark text-[15px] font-normal font-outfit">
          Amount
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-app-black text-[18px] font-medium font-outfit">
            {amount}
          </span>
          <span className="text-app-grey-medium text-[13px] font-medium font-outfit">
            {currency}
          </span>
        </div>
        <div className="absolute bottom-0 left-5 right-5 h-px bg-app-grey-line" />
      </div>

      {/* Commission row */}
      <div className="flex items-center justify-between w-full h-[49px] bg-app-white px-5">
        <span className="text-app-grey-dark text-[15px] font-normal font-outfit">
          Comission
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-app-black text-[18px] font-medium font-outfit">
            {commission}
          </span>
          <span className="text-app-grey-medium text-[13px] font-medium font-outfit">
            {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
