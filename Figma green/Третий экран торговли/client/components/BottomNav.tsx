interface BottomNavProps {
  active?: "home" | "wallet" | "bot" | "support";
}

export default function BottomNav({ active = "bot" }: BottomNavProps) {
  return (
    <div
      className="sticky bottom-5 z-50 mx-5 flex items-center justify-around py-[10px] px-[26px] rounded-[50px] backdrop-blur-md"
      style={{
        background: "rgba(25,25,25,0.55)",
        boxShadow: "0 -4px 20px 0 rgba(45,110,147,0.08)",
        height: 72,
      }}
    >
      {/* Home */}
      <button className="flex items-center justify-center p-[14px] rounded-[30px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 20H4V10L12 4L20 10V20Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 14V20" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Wallet */}
      <button className="flex items-center justify-center p-[14px] rounded-[30px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 8H3V20H21V8Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 8V4H17V8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 14H17" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Bot (active) */}
      <button
        className="flex items-center justify-center p-[14px] rounded-[30px]"
        style={{ background: active === "bot" ? "#40FF96" : "transparent" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 4V20H20" stroke={active === "bot" ? "#191919" : "white"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          <path d="M9 13L13 9L16 12L20 8" stroke={active === "bot" ? "#191919" : "white"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Support */}
      <button className="flex items-center justify-center p-[14px] rounded-[30px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="white"/>
          <path d="M8 11H8.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11H12.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 11H16.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
