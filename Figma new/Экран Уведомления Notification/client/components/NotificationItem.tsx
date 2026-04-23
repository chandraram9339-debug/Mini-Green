type NotificationType = "successful" | "unsuccessful";

interface NotificationItemProps {
  type: NotificationType;
  description: string;
  timestamp: string;
}

function SuccessIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#73C1B1"/>
      <path d="M8 11.5L11 14.5L17 8.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
    </svg>
  );
}

function UnsuccessfulIcon() {
  return (
    <div className="w-6 h-6 rounded-full bg-app-red flex items-center justify-center flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 4.5L11.5 11.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        <path d="M4.5 11.5L11.5 4.49999" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default function NotificationItem({ type, description, timestamp }: NotificationItemProps) {
  const isSuccessful = type === "successful";

  return (
    <div className="w-full bg-white rounded-xl px-[10px] py-4 flex flex-col gap-1">
      {/* Title row */}
      <div className="flex items-center gap-[10px]">
        <div className="flex-shrink-0">
          {isSuccessful ? <SuccessIcon /> : <UnsuccessfulIcon />}
        </div>
        <span className="font-outfit font-medium text-[18px] text-app-black leading-normal tracking-[0.18px]">
          {isSuccessful ? "Successful:" : "Unsuccessful:"}
        </span>
      </div>

      {/* Description row */}
      <div className="flex items-center gap-[10px]">
        {/* Spacer matching icon width */}
        <div className="w-6 flex-shrink-0" />
        <span className="font-outfit font-normal text-[15px] text-app-grey-dark leading-normal">
          {description}
        </span>
      </div>

      {/* Timestamp */}
      <div className="flex justify-end pr-[10px] mt-1">
        <span className="font-outfit font-normal text-[10px] text-app-grey-medium uppercase leading-normal">
          {timestamp}
        </span>
      </div>
    </div>
  );
}
