import { useState } from "react";
import { ArrowLeft, FileText, HelpCircle, MessageSquare, UserPlus, AlertTriangle, Vibrate } from "lucide-react";
import { Toggle } from "@/components/settings/Toggle";
import { SettingsItem } from "@/components/settings/SettingsItem";

// ── SVG Icons exactly from the Figma design ──────────────────────────────────

function TranslateIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.5 18L21 21M12.5 18H19.5H12.5ZM12.5 18L11 21L12.5 18ZM12.5 18L16 11L19.5 18H12.5Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M9 3V5" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M10.0481 14.5C8.50819 12.9059 7.27557 11.0413 6.41211 9" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M12.751 5C11.783 10.77 8.07 15.61 3 18.129" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M3 5H15" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M0 15H18" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M7 19H11" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 18V10C5 8.14348 5.7375 6.36301 7.05025 5.05025C8.36301 3.7375 10.1435 3 12 3C13.8565 3 15.637 3.7375 16.9497 5.05025C18.2625 6.36301 19 8.14348 19 10V18" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M3 18H21" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
      <path d="M10 22H14" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 5C5.89543 5 5 5.89543 5 7V8.17157C5 8.70201 4.78929 9.21071 4.41421 9.58579L3.41421 10.5858C2.63317 11.3668 2.63316 12.6332 3.41421 13.4142L4.41421 14.4142C4.78929 14.7893 5 15.298 5 15.8284V17C5 18.1046 5.89543 19 7 19H8.17157C8.70201 19 9.21071 19.2107 9.58579 19.5858L10.5858 20.5858C11.3668 21.3668 12.6332 21.3668 13.4142 20.5858L14.4142 19.5858C14.7893 19.2107 15.298 19 15.8284 19H17C18.1046 19 19 18.1046 19 17V15.8284C19 15.298 19.2107 14.7893 19.5858 14.4142L20.5858 13.4142C21.3668 12.6332 21.3668 11.3668 20.5858 10.5858L19.5858 9.58579C19.2107 9.21071 19 8.70201 19 8.17157V7C19 5.89543 18.1046 5 17 5H15.8284C15.298 5 14.7893 4.78929 14.4142 4.41421L13.4142 3.41421C12.6332 2.63317 11.3668 2.63316 10.5858 3.41421L9.58579 4.41421C9.21071 4.78929 8.70201 5 8.17157 5H7Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SupportChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="#55647B"/>
      <path d="M8 11H8.01" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11H12.01" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 11H16.01" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8C8 7.204 8.369 6.441 9.025 5.879C9.681 5.316 10.572 5 11.5 5H12.5C13.428 5 14.319 5.316 14.975 5.879C15.63 6.44 16 7.204 16 8C16.0368 8.64925 15.8617 9.2929 15.501 9.83398C15.1402 10.3751 14.6135 10.7843 14 11C13.386 11.288 12.86 11.833 12.499 12.555C12.1303 13.3153 11.9588 14.1561 12 15" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 19V19.01" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 21V3H15L20 8V21H4Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 3V8H20" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#73C1B1"/>
      <path d="M8 11.5L11 14.5L17 8.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px w-full bg-tg-line" />;
}

const LANGUAGES = ["English", "Spanish", "French", "German", "Russian"];

function LanguageSection({
  selectedLanguage,
  onSelect,
  expanded,
  onToggleExpand,
}: {
  selectedLanguage: string;
  onSelect: (lang: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <div className="flex flex-col gap-[9px]">
      {/* Language trigger row */}
      <button
        onClick={onToggleExpand}
        className="flex w-full items-center gap-2 rounded-xl bg-tg-white px-3 py-3 text-left transition-opacity active:opacity-70"
      >
        <span className="flex-shrink-0">
          <TranslateIcon />
        </span>
        <span className="flex-1 text-[18px] font-medium leading-normal tracking-[0.18px] text-tg-black">
          Language
        </span>
        <span className="text-[16px] font-normal leading-normal text-tg-grey">
          {selectedLanguage}
        </span>
      </button>

      {/* Language dropdown */}
      {expanded && (
        <div className="w-full overflow-hidden rounded-xl bg-tg-white">
          {LANGUAGES.map((lang, i) => (
            <button
              key={lang}
              onClick={() => onSelect(lang)}
              className={`flex w-full items-center gap-2 px-3 py-3 text-left transition-opacity active:opacity-70 ${
                i < LANGUAGES.length - 1 ? "border-b border-tg-line" : ""
              }`}
            >
              {lang === selectedLanguage ? (
                <CheckIcon />
              ) : (
                <span className="h-6 w-6 flex-shrink-0 rounded-full border-2 border-tg-line" />
              )}
              <span className="text-[16px] font-normal leading-normal text-tg-grey">
                {lang}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────

export default function Settings() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [languageExpanded, setLanguageExpanded] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [vibration, setVibration] = useState(true);

  const handleSelectLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    setLanguageExpanded(false);
  };

  return (
    <div className="min-h-screen w-full bg-tg-bg font-sans">
      {/* Centered container for web */}
      <div className="mx-auto flex min-h-screen max-w-[500px] flex-col">

        {/* ── App Bar ─────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 flex items-center bg-tg-bg px-4 py-3">
          {/* Back button */}
          <button className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity active:opacity-70">
            <ArrowLeft size={24} className="text-tg-grey" />
          </button>

          {/* Title */}
          <h1 className="flex-1 text-center text-[20px] font-medium leading-normal tracking-[0.4px] text-tg-black">
            Settings
          </h1>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Notification bell with badge */}
            <div className="relative">
              <BellIcon />
              <span className="absolute -right-1 -top-1 flex h-[13px] w-[13px] items-center justify-center rounded-full bg-tg-blue">
                <span className="text-[7px] font-medium leading-none tracking-[0.14px] text-white">
                  3
                </span>
              </span>
            </div>
            <GearIcon />
          </div>
        </header>

        {/* Divider under header */}
        <div className="mx-4">
          <Divider />
        </div>

        {/* ── Scrollable content ──────────────────────────────────────── */}
        <main className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-28 pt-5">

          {/* Language section */}
          <LanguageSection
            selectedLanguage={selectedLanguage}
            onSelect={handleSelectLanguage}
            expanded={languageExpanded}
            onToggleExpand={() => setLanguageExpanded((v) => !v)}
          />

          <Divider />

          {/* Notifications section */}
          <div className="flex flex-col gap-[9px]">
            <SettingsItem
              icon={<NotificationIcon />}
              label="Push notifications"
              rightContent={
                <Toggle
                  checked={pushNotifications}
                  onChange={() => setPushNotifications((v) => !v)}
                  label="Push notifications"
                />
              }
            />
            <SettingsItem
              icon={<Vibrate size={24} className="text-tg-grey" />}
              label="Vibration"
              rightContent={
                <Toggle
                  checked={vibration}
                  onChange={() => setVibration((v) => !v)}
                  label="Vibration"
                />
              }
            />
          </div>

          <Divider />

          {/* Support section */}
          <div className="flex flex-col gap-[9px]">
            <SettingsItem
              icon={<SupportChatIcon />}
              label="Support"
              showChevron
            />
            <SettingsItem
              icon={<QuestionIcon />}
              label="FAQ"
              showChevron
            />
            <SettingsItem
              icon={<UserPlus size={24} className="text-tg-grey" />}
              label="Referral link"
              showChevron
            />
            <SettingsItem
              icon={<AlertTriangle size={24} className="text-tg-grey" />}
              label="Seed code"
              showChevron
            />
          </div>

          <Divider />

          {/* User Agreement */}
          <div className="flex flex-col gap-[9px]">
            <SettingsItem
              icon={<FileIcon />}
              label="User Agreement"
              showChevron
            />
          </div>
        </main>
      </div>
    </div>
  );
}
