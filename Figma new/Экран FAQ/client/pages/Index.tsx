import { FAQItem } from "@/components/FAQItem";

const faqItems = [
  {
    id: 1,
    question: "How to withdraw money?",
    answer: null,
  },
  {
    id: 2,
    question: "How to deposit funds?",
    answer: null,
  },
  {
    id: 3,
    question: "How to withdraw money?",
    defaultOpen: true,
    answer: (
      <span>
        To withdraw money, go to the menu section &ldquo;My account&rdquo; &ndash; &ldquo;Withdrawal
        of funds&rdquo; &ndash; &ldquo;Withdrawal request&rdquo; enter the required available amount
        and the USDT TRC20 wallet.{" "}
        <br />
        The withdrawal process is automatic and takes from 10 minutes to 2-3 hours. The maximum
        withdrawal time is up to 7 days.
        <br />
        During the consideration, trading for your account will be stopped.
        <br />
        <br />
        Attention ! Replenishment is realized only to the{" "}
        <span className="text-faq-green">USDT TRC20</span> wallet!
        <br />
        The minimum amount is <span className="text-faq-green">5 USDT</span>!
      </span>
    ),
  },
  {
    id: 4,
    question: "How to withdraw money? How to withdraw money?",
    answer: null,
  },
  {
    id: 5,
    question: "How to withdraw money?",
    answer: null,
  },
  {
    id: 6,
    question: "How to withdraw money?",
    answer: null,
  },
  {
    id: 7,
    question: "How to withdraw money?",
    answer: null,
  },
];

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 20H4V10L12 4L20 10V20Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14V20" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 8H3V20H21V8Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8V4H17V8" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 14H17" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4V20H20" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M9 13L13 9L16 12L20 8" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

function SupportIcon({ active }: { active?: boolean }) {
  const color = active ? "white" : "#55647B";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z"
        fill={color}
      />
      <path d="M8 11H8.01" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11H12.01" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11H16.01" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#55647B" />
      <path d="M10 18L4 12L10 6" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 5C5.89543 5 5 5.89543 5 7V8.17157C5 8.70201 4.78929 9.21071 4.41421 9.58579L3.41421 10.5858C2.63317 11.3668 2.63316 12.6332 3.41421 13.4142L4.41421 14.4142C4.78929 14.7893 5 15.298 5 15.8284V17C5 18.1046 5.89543 19 7 19H8.17157C8.70201 19 9.21071 19.2107 9.58579 19.5858L10.5858 20.5858C11.3668 21.3668 12.6332 21.3668 13.4142 20.5858L14.4142 19.5858C14.7893 19.2107 15.298 19 15.8284 19H17C18.1046 19 19 18.1046 19 17V15.8284C19 15.298 19.2107 14.7893 19.5858 14.4142L20.5858 13.4142C21.3668 12.6332 21.3668 11.3668 20.5858 10.5858L19.5858 9.58579C19.2107 9.21071 19 8.70201 19 8.17157V7C19 5.89543 18.1046 5 17 5H15.8284C15.298 5 14.7893 4.78929 14.4142 4.41421L13.4142 3.41421C12.6332 2.63317 11.3668 2.63316 10.5858 3.41421L9.58579 4.41421C9.21071 4.78929 8.70201 5 8.17157 5H7Z"
        stroke="#55647B"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="#55647B"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <div className="relative w-6 h-6">
      <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-[3px] top-[3px]">
        <path d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
        <path d="M0 15H18" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
        <path d="M7 19H11" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      </svg>
      <div className="absolute -top-0.5 left-3 w-[13px] h-[13px] rounded-full bg-faq-blue flex items-center justify-center">
        <span className="font-outfit font-medium text-white leading-none" style={{ fontSize: "7px" }}>25</span>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-faq-bg flex flex-col overflow-x-hidden">
      {/* Centering wrapper for web */}
      <div className="flex flex-col flex-1 w-full max-w-[500px] mx-auto min-h-screen">

        {/* Header / App Bar */}
        <div className="bg-faq-bg sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Back button */}
            <button className="flex items-center justify-center w-8 h-8 rounded-full">
              <BackIcon />
            </button>

            {/* Title */}
            <span className="font-outfit font-medium text-[20px] text-faq-navy">FAQ</span>

            {/* Right icons */}
            <div className="flex items-center gap-4">
              <BellIcon />
              <SettingsIcon />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-faq-grey-line mx-5" />
        </div>

        {/* Scrollable FAQ List */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-[9px]">
            {faqItems.map((item) => (
              <FAQItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                defaultOpen={item.defaultOpen}
              />
            ))}
          </div>
        </div>

        {/* Bottom Tab Bar */}
        <div className="bg-white sticky bottom-0 z-10 rounded-t-xl shadow-[0_-4px_20px_0_rgba(45,110,147,0.08)]">
          <div className="flex items-center justify-around px-4 h-[72px]">
            {/* Home */}
            <button className="flex items-center justify-center p-[14px] rounded-full">
              <HomeIcon />
            </button>

            {/* Wallet */}
            <button className="flex items-center justify-center p-[14px] rounded-full">
              <WalletIcon />
            </button>

            {/* Bot / Analytics */}
            <button className="flex items-center justify-center p-[14px] rounded-full">
              <BotIcon />
            </button>

            {/* Support (active) */}
            <button className="flex items-center justify-center p-[14px] rounded-full bg-faq-blue">
              <SupportIcon active />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
