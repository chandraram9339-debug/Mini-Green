interface ReferralItem {
  id: number;
  username: string;
  bonus: string;
  date: string;
}

const referrals: ReferralItem[] = [
  { id: 1, username: "@Anna_", bonus: "+5.22", date: "31.12.2024 00:00" },
  { id: 2, username: "@Maksim_254", bonus: "+20.22", date: "15.12.2024 14:30" },
  { id: 3, username: "@AlexV", bonus: "+5.00", date: "10.12.2024 09:15" },
  { id: 4, username: "@bingo765", bonus: "+700.00", date: "05.12.2024 18:45" },
  { id: 5, username: "@Max", bonus: "+11.10", date: "31.12.2024 00:00" },
];

function ReferralIcon() {
  return (
    <div className="w-6 h-6 rounded-[30px] bg-wallet-grey-medium flex items-center justify-center shrink-0">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.99967 10.6663C9.47243 10.6663 10.6663 9.47243 10.6663 7.99967C10.6663 6.52692 9.47243 5.33301 7.99967 5.33301C6.52692 5.33301 5.33301 6.52692 5.33301 7.99967C5.33301 9.47243 6.52692 10.6663 7.99967 10.6663Z"
          stroke="white"
          strokeWidth="1.06667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.6667 5.99982V7.99982C10.6667 9.47315 11.4133 10.6665 12.3333 10.6665C13.2533 10.6665 14 9.47315 14 7.99982C13.9998 6.69525 13.5743 5.4263 12.7882 4.38522C12.002 3.34415 10.8979 2.58766 9.64323 2.23038C8.38854 1.8731 7.05159 1.93448 5.83491 2.40523C4.61824 2.87599 3.58814 3.73046 2.90068 4.83919C2.21322 5.94793 1.90585 7.25052 2.02514 8.54963C2.14444 9.84873 2.68389 11.0736 3.56177 12.0386C4.43966 13.0036 5.60814 13.6561 6.8902 13.8974C8.17226 14.1387 9.49803 13.9556 10.6667 13.3758"
          stroke="white"
          strokeWidth="1.06667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function ReferralList() {
  return (
    <div className="flex flex-col gap-[9px] overflow-x-hidden">
      {referrals.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2.5 bg-white rounded-xl px-2.5 py-4"
        >
          <ReferralIcon />

          {/* Username */}
          <span className="flex-1 min-w-0 text-wallet-black font-outfit font-medium text-lg leading-tight tracking-[0.18px] truncate">
            {item.username}
          </span>

          {/* Right: bonus + date */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-wallet-black font-outfit font-medium text-base leading-none text-right">
                {item.bonus}
              </span>
              <span className="text-wallet-grey-dark font-outfit font-normal text-[9px] leading-none">
                USDT
              </span>
            </div>
            <span className="text-wallet-grey-medium font-outfit font-normal text-[10px] uppercase leading-none text-right">
              {item.date}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
