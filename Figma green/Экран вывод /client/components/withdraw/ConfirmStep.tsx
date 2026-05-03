interface ConfirmStepProps {
  recipient: string;
  amount: string;
  commission: string;
  onConfirm: () => void;
}

function InfoRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between bg-app-card rounded-3xl px-5 h-[49px]">
      <span className="font-outfit text-[15px] text-white">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-outfit text-[18px] font-medium text-app-green">{value}</span>
        {unit && <span className="font-outfit text-[13px] font-medium text-white">{unit}</span>}
      </div>
    </div>
  );
}

export default function ConfirmStep({
  recipient,
  amount,
  commission,
  onConfirm,
}: ConfirmStepProps) {
  return (
    <div className="flex flex-col flex-1 px-5 gap-5 overflow-y-auto">
      {/* Cheque rows */}
      <div className="flex flex-col gap-[10px]">
        {/* Recipient */}
        <div className="flex items-center justify-between bg-app-card rounded-3xl px-5 h-[49px]">
          <span className="font-outfit text-[15px] text-white">Recipient</span>
          <span className="font-outfit text-[18px] font-medium text-app-green">{recipient}</span>
        </div>

        {/* Amount */}
        <InfoRow label="Amount" value={amount} unit="USDT" />

        {/* Commission */}
        <InfoRow label="Comission" value={commission} unit="USDT" />
      </div>

      {/* Commission note */}
      <p className="font-outfit text-[12px] text-white text-right leading-[18px] self-end max-w-[268px]">
        *The commission is charged from the remaining balance. We charge a 10% fee on withdrawals.
      </p>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className="w-full h-[52px] rounded-[54px] bg-app-green font-outfit text-[16px] text-[#191919] flex items-center justify-center"
      >
        Confirm and Send
      </button>
    </div>
  );
}
