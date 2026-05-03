import { Link, useLocation } from "react-router-dom";

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 20H4V10L12 4L20 10V20Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14V20" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WalletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 8H3V20H21V8Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 8V4H17V8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 14H17" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4V20H20" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
    <path d="M9 13L13 9L16 12L20 8" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
  </svg>
);

const SupportIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill={active ? "#191919" : "white"}/>
    <path d="M8 11H8.01" stroke={active ? "#191919" : "white"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11H12.01" stroke={active ? "#191919" : "white"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 11H16.01" stroke={active ? "#191919" : "white"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const tabs = [
  { path: "/", label: "Home", icon: <HomeIcon /> },
  { path: "/wallet", label: "Wallet", icon: <WalletIcon /> },
  { path: "/bot", label: "Bot", icon: <BotIcon /> },
  { path: "/support", label: "Support", icon: null },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[350px] z-50">
      {/* Green glow effects */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 322,
          height: 35,
          background: "rgba(64, 255, 150, 0.32)",
          borderRadius: "50%",
          filter: "blur(32.5px)",
          bottom: -10,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 66,
          height: 9,
          background: "#40FF96",
          borderRadius: "50%",
          filter: "blur(15px)",
          bottom: -4,
          right: 26,
        }}
      />

      <nav
        className="relative flex items-center justify-between px-7 py-2.5 rounded-[50px] h-[72px]"
        style={{
          background: "rgba(25, 25, 25, 0.55)",
          boxShadow: "0 -4px 20px 0 rgba(45, 110, 147, 0.08)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex items-center justify-center rounded-[30px] p-3.5 transition-all duration-200"
              style={{
                background: active ? "#40FF96" : "transparent",
              }}
            >
              {tab.label === "Support" ? (
                <SupportIcon active={active} />
              ) : (
                tab.icon
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
