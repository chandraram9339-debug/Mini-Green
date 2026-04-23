import { Link, useLocation } from "react-router-dom";

const tabs = [
  {
    path: "/home",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20H4V10L12 4L20 10V20Z" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14V20" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: "/wallet",
    label: "Wallet",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 8H3V20H21V8Z" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 8V4H17V8" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 14H17" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: "/bot",
    label: "Bot",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4V20H20" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        <path d="M9 13L13 9L16 12L20 8" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: "/",
    label: "Support",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill={active ? "white" : "#55647B"}/>
        <path d="M8 11H8.01" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11H12.01" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 11H16.01" stroke={active ? "white" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function TabBar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-[500px] bg-white rounded-t-xl shadow-[0_-4px_20px_0_rgba(45,110,147,0.08)]">
        <div className="flex items-center justify-around px-4 py-2.5 h-[72px]">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center"
              >
                <div
                  className={`flex items-center justify-center w-[52px] h-[52px] rounded-[30px] transition-colors ${
                    active ? "bg-app-blue" : "bg-transparent"
                  }`}
                >
                  {tab.icon(active)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
