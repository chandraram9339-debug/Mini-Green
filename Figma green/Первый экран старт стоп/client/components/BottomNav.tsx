import { useState } from "react";

type NavItem = "home" | "wallet" | "bot" | "support";

export default function BottomNav() {
  const [active, setActive] = useState<NavItem>("home");

  return (
    <div className="relative px-5 pb-5 pt-3 shrink-0">
      {/* Green glow effect at bottom */}
      <div
        className="absolute left-5 right-5 pointer-events-none"
        style={{
          bottom: 44,
          height: 35,
          background: "rgba(64, 255, 150, 0.32)",
          borderRadius: "50%",
          filter: "blur(32.5px)",
        }}
      />
      {/* Brighter glow on right side */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: 42,
          bottom: 40,
          width: 66,
          height: 9,
          background: "#40FF96",
          borderRadius: "50%",
          filter: "blur(15px)",
        }}
      />

      <nav
        className="relative flex items-center justify-between px-[26px] rounded-[50px] h-[72px]"
        style={{
          background: "rgba(25, 25, 25, 0.55)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 -4px 20px 0 rgba(45, 110, 147, 0.08)",
        }}
      >
        {/* Home */}
        <button
          onClick={() => setActive("home")}
          className={`flex items-center justify-center p-[14px] rounded-[30px] transition-colors ${
            active === "home" ? "bg-brand-green" : "bg-transparent"
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 20H4V10L12 4L20 10V20Z"
              stroke={active === "home" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 14V20"
              stroke={active === "home" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Wallet */}
        <button
          onClick={() => setActive("wallet")}
          className={`flex items-center justify-center p-[14px] rounded-[30px] transition-colors ${
            active === "wallet" ? "bg-brand-green" : "bg-transparent"
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 8H3V20H21V8Z"
              stroke={active === "wallet" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 8V4H17V8"
              stroke={active === "wallet" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 14H17"
              stroke={active === "wallet" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Bot / Chart */}
        <button
          onClick={() => setActive("bot")}
          className={`flex items-center justify-center p-[14px] rounded-[30px] transition-colors ${
            active === "bot" ? "bg-brand-green" : "bg-transparent"
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4V20H20"
              stroke={active === "bot" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
            <path
              d="M9 13L13 9L16 12L20 8"
              stroke={active === "bot" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Support */}
        <button
          onClick={() => setActive("support")}
          className={`flex items-center justify-center p-[14px] rounded-[30px] transition-colors ${
            active === "support" ? "bg-brand-green" : "bg-transparent"
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z"
              fill={active === "support" ? "#191919" : "white"}
            />
            <path
              d="M8 11H8.01"
              stroke={active === "support" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 11H12.01"
              stroke={active === "support" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 11H16.01"
              stroke={active === "support" ? "#191919" : "white"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </nav>
    </div>
  );
}
