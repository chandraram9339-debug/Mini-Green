import { useState } from "react";

export default function Index() {
  const [languageOpen, setLanguageOpen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [vibration, setVibration] = useState(true);

  const languages = ["English", "Spanish"];

  return (
    <div className="flex justify-center items-start min-h-dvh bg-app-dark">
      <div
        className="relative w-full flex flex-col min-h-dvh font-outfit"
        style={{ maxWidth: 430 }}
      >
        {/* Status Bar */}
        <StatusBar />

        {/* App Bar */}
        <AppBar />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-28 pt-2">
          {/* Language Section */}
          <section className="px-5 mt-2 flex flex-col gap-2.5">
            {/* Language header row */}
            <button
              className="flex w-full items-center gap-2 rounded-3xl bg-app-card px-2.5 py-3 text-left"
              onClick={() => setLanguageOpen((v) => !v)}
            >
              <TranslateIcon />
              <span className="flex-1 text-white font-medium text-lg tracking-tight">
                Language
              </span>
              <span className="text-white text-base font-normal mr-1">
                {selectedLanguage}
              </span>
            </button>

            {/* Language dropdown list */}
            {languageOpen && (
              <div className="flex flex-col gap-0.5">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    className="flex w-full items-center gap-2 rounded-3xl bg-app-card px-2.5 py-3 text-left"
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {selectedLanguage === lang ? (
                      <CheckCircleIcon />
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0" />
                    )}
                    <span className="text-white text-base font-normal">
                      {lang}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Notifications Section */}
          <section className="px-5 mt-2.5 flex flex-col gap-0.5">
            <div className="flex items-center gap-2 rounded-3xl bg-app-card px-2.5 py-3">
              <BellIcon />
              <span className="flex-1 text-white font-medium text-lg tracking-tight">
                Push notifications
              </span>
              <Toggle
                active={pushNotifications}
                onToggle={() => setPushNotifications((v) => !v)}
              />
            </div>

            <div className="flex items-center gap-2 rounded-3xl bg-app-card px-2.5 py-3">
              <PhoneVibrateIcon />
              <span className="flex-1 text-white font-medium text-lg tracking-tight">
                Vibration
              </span>
              <Toggle
                active={vibration}
                onToggle={() => setVibration((v) => !v)}
              />
            </div>
          </section>

          {/* Support Section */}
          <section className="px-5 mt-2.5 flex flex-col gap-0.5">
            <ListItem icon={<SupportIcon />} label="Support" />
            <ListItem icon={<FaqIcon />} label="FAQ" />
            <ListItem icon={<LinkIcon />} label="Referral link" />
            <ListItem icon={<SeedIcon />} label="Seed code" />
          </section>

          {/* User Agreement */}
          <section className="px-5 mt-2.5">
            <ListItem icon={<FileIcon />} label="User Agreement" />
          </section>
        </div>

        {/* Bottom Tab Bar */}
        <BottomTabBar />

        {/* Green glow at bottom */}
        <div
          className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2"
          style={{
            width: 322,
            height: 35,
            borderRadius: 322,
            background: "rgba(64, 255, 150, 0.32)",
            filter: "blur(32.5px)",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────── */

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-1 flex-shrink-0">
      <span className="text-white text-sm font-medium" style={{ fontFamily: "Outfit, sans-serif" }}>
        9:41
      </span>
      <div className="flex items-center gap-1">
        {/* Network Signal */}
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <rect x="2" y="7.5" width="3" height="4.5" rx="0.5" fill="white" />
          <rect x="6.5" y="6" width="3" height="6" rx="0.5" fill="white" />
          <rect x="11" y="4" width="3" height="8" rx="0.5" fill="white" />
          <rect x="15.5" y="2" width="3" height="10" rx="0.5" fill="white" fillOpacity="0.3" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5C8.55 9.5 9 9.95 9 10.5C9 11.05 8.55 11.5 8 11.5C7.45 11.5 7 11.05 7 10.5C7 9.95 7.45 9.5 8 9.5Z" fill="white" />
          <path d="M5.17 7.17C5.9 6.44 6.9 6 8 6C9.1 6 10.1 6.44 10.83 7.17L12 6C10.95 4.95 9.55 4.3 8 4.3C6.45 4.3 5.05 4.95 4 6L5.17 7.17Z" fill="white" />
          <path d="M2.34 4.34C3.72 2.96 5.75 2.1 8 2.1C10.25 2.1 12.28 2.96 13.66 4.34L14.83 3.17C13.11 1.45 10.67 0.4 8 0.4C5.33 0.4 2.89 1.45 1.17 3.17L2.34 4.34Z" fill="white" />
        </svg>
        {/* Battery */}
        <svg width="25" height="13" viewBox="0 0 25 13" fill="none">
          <rect x="0.5" y="0.5" width="21" height="12" rx="2.5" stroke="white" strokeOpacity="0.6" />
          <rect x="2" y="2" width="18" height="9" rx="1" fill="white" />
          <path d="M23.5 4.5V8.5C24.05 8.5 24.5 8.05 24.5 7.5V5.5C24.5 4.95 24.05 4.5 23.5 4.5Z" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

function AppBar() {
  return (
    <div className="flex items-center px-4 pb-3 pt-1 flex-shrink-0">
      {/* Back button */}
      <button className="w-8 h-8 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M10 18L4 12L10 6" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          <path d="M4 12H20" stroke="white" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
      </button>

      {/* Title */}
      <div className="flex-1 flex justify-center">
        <span className="text-white font-medium text-xl tracking-wide" style={{ fontFamily: "Outfit, sans-serif" }}>
          Settings
        </span>
      </div>

      {/* Notification bell with badge */}
      <button className="relative w-9 h-9 flex items-center justify-center mr-1">
        <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
          <path d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          <path d="M0 15H18" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          <path d="M7 19H11" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
        </svg>
        <span
          className="absolute top-0 right-0 w-[13px] h-[13px] rounded-full bg-app-green flex items-center justify-center"
          style={{ fontSize: 7, color: "#0A0A0A", fontWeight: 500 }}
        >
          25
        </span>
      </button>

      {/* Settings icon */}
      <button className="w-8 h-8 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 5C5.89543 5 5 5.89543 5 7V8.17157C5 8.70201 4.78929 9.21071 4.41421 9.58579L3.41421 10.5858C2.63317 11.3668 2.63316 12.6332 3.41421 13.4142L4.41421 14.4142C4.78929 14.7893 5 15.298 5 15.8284V17C5 18.1046 5.89543 19 7 19H8.17157C8.70201 19 9.21071 19.2107 9.58579 19.5858L10.5858 20.5858C11.3668 21.3668 12.6332 21.3668 13.4142 20.5858L14.4142 19.5858C14.7893 19.2107 15.298 19 15.8284 19H17C18.1046 19 19 18.1046 19 17V15.8284C19 15.298 19.2107 14.7893 19.5858 14.4142L20.5858 13.4142C21.3668 12.6332 21.3668 11.3668 20.5858 10.5858L19.5858 9.58579C19.2107 9.21071 19 8.70201 19 8.17157V7C19 5.89543 18.1046 5 17 5H15.8284C15.298 5 14.7893 4.78929 14.4142 4.41421L13.4142 3.41421C12.6332 2.63317 11.3668 2.63316 10.5858 3.41421L9.58579 4.41421C9.21071 4.78929 8.70201 5 8.17157 5H7Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0"
      style={{ width: 34, height: 20 }}
      aria-checked={active}
      role="switch"
    >
      {/* Track */}
      <div
        className="absolute rounded-[10px] transition-colors duration-200"
        style={{
          left: 3,
          top: 3,
          width: 28,
          height: 14,
          background: active ? "rgba(64, 255, 150, 0.25)" : "rgba(255,255,255,0.15)",
        }}
      />
      {/* Thumb */}
      <div
        className="absolute rounded-full transition-all duration-200"
        style={{
          width: 20,
          height: 20,
          top: 0,
          left: active ? 14 : 0,
          background: active ? "#40FF96" : "rgba(255,255,255,0.4)",
        }}
      />
    </button>
  );
}

function ListItem({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full items-center gap-2 rounded-3xl bg-app-card px-2.5 py-3 text-left">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-white font-medium text-lg tracking-tight">
        {label}
      </span>
    </button>
  );
}

function TabIcon({ id, active }: { id: string; active: boolean }) {
  const c = active ? "#191919" : "white";
  if (id === "home") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 20H4V10L12 4L20 10V20Z" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 14V20" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === "wallet") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21 8H3V20H21V8Z" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 8V4H17V8" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 14H17" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === "bot") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 4V20H20" stroke={c} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
        <path d="M9 13L13 9L16 12L20 8" stroke={c} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      </svg>
    );
  }
  // support
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 4H3V18H6L9 21L12 18H21V4Z"
        fill={active ? "#191919" : "none"}
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 11H8.01" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 11H12.01" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 11H16.01" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BottomTabBar() {
  const [active, setActive] = useState("support");
  const tabIds = ["home", "wallet", "bot", "support"];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center" style={{ maxWidth: 430 }}>
      <div
        className="mx-5 mb-4 flex items-center justify-around rounded-[50px] px-4 py-2.5 w-full"
        style={{
          background: "rgba(25, 25, 25, 0.55)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 -4px 20px 0 rgba(45, 110, 147, 0.08)",
        }}
      >
        {tabIds.map((id) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className="flex items-center justify-center w-12 h-12 rounded-[30px] transition-colors duration-200"
            style={{
              background: active === id ? "#40FF96" : "transparent",
            }}
          >
            <TabIcon id={id} active={active === id} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Icons ─────────────────────────────────────────────────────── */

function TranslateIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M19.5 18L21 21M12.5 18H19.5H12.5ZM12.5 18L11 21L12.5 18ZM12.5 18L16 11L19.5 18H12.5Z" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M9 3V5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M10.0481 14.5C8.50819 12.9059 7.27557 11.0413 6.41211 9" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M12.751 5C11.783 10.77 8.07 15.61 3 18.129" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M3 5H15" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <rect width="24" height="24" rx="12" fill="#40FF96" />
      <path d="M8 11.5L11 14.5L17 8.5" stroke="black" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M5 18V10C5 8.14348 5.7375 6.36301 7.05025 5.05025C8.36301 3.7375 10.1435 3 12 3C13.8565 3 15.637 3.7375 16.9497 5.05025C18.2625 6.36301 19 8.14348 19 10V18" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M3 18H21" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M10 22H14" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneVibrateIcon() {
  return (
    <img
      src="https://api.builder.io/api/v1/image/assets/TEMP/82f8f44cf8cbfd5688af573972108dcca6d5fd9b?width=38"
      alt=""
      className="w-5 h-5 flex-shrink-0 object-contain"
    />
  );
}

function SupportIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M21 4H3V18H6L9 21L12 18H21V4Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11H8.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11H12.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11H16.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M8 8C8 7.204 8.369 6.441 9.025 5.879C9.681 5.316 10.572 5 11.5 5H12.5C13.428 5 14.319 5.316 14.975 5.879C15.63 6.44 16 7.204 16 8C16.0368 8.64925 15.8617 9.2929 15.501 9.83398C15.1402 10.3751 14.6135 10.7843 14 11C13.386 11.288 12.86 11.833 12.499 12.555C12.1303 13.3153 11.9588 14.1561 12 15" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19V19.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55921 13.47 3.46997L11.75 5.17997" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11C13.5705 10.4259 13.0226 9.95085 12.3934 9.60706C11.7642 9.26327 11.0684 9.05885 10.3533 9.00763C9.63816 8.95641 8.92037 9.05964 8.24861 9.3102C7.57685 9.56077 6.96684 9.95296 6.45996 10.46L3.45996 13.46C2.54921 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.542 3.52086 20.469C4.4479 21.396 5.70197 21.9219 7.01295 21.9333C8.32393 21.9447 9.58694 21.4406 10.53 20.53L12.24 18.82" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SeedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="white" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="white" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="white" strokeWidth="1.6" />
      <path d="M14 14H17V17M17 14H21M14 21H17M21 17V21H17" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5" y="5" width="3" height="3" fill="white" />
      <rect x="16" y="5" width="3" height="3" fill="white" />
      <rect x="5" y="16" width="3" height="3" fill="white" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path d="M4 21V3H15L20 8V21H4Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3V8H20" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
