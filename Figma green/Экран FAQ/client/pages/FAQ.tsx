import { useState } from "react";
import styles from "./FAQ.module.css";

// ─── Data ────────────────────────────────────────────────────────────────────

interface FaqAnswerPart {
  text: string;
  highlight?: boolean;
}

interface FaqItem {
  id: number;
  question: string;
  answer: FaqAnswerPart[] | null;
}

const faqs: FaqItem[] = [
  {
    id: 1,
    question: "How to register an account?",
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
    answer: [
      {
        text: 'To withdraw money, go to the menu section "My account" - "Withdrawal of funds" - "Withdrawal request" enter the required available amount and the ',
      },
      { text: "USDT TRC20", highlight: true },
      {
        text: " wallet.\nThe withdrawal process is automatic and takes from 10 minutes to 2-3 hours. The maximum withdrawal time is up to 7 days.\nDuring the consideration, trading for your account will be stopped.\n\nAttention ! Replenishment is realized only to the ",
      },
      { text: "USDT TRC20", highlight: true },
      { text: " wallet!\nThe minimum amount is " },
      { text: "5 USDT", highlight: true },
      { text: "!" },
    ],
  },
  {
    id: 4,
    question: "What is the minimum deposit amount?",
    answer: null,
  },
  {
    id: 5,
    question: "How does automated trading work?",
    answer: null,
  },
  {
    id: 6,
    question: "How to contact support?",
    answer: null,
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div className={styles.statusBar}>
      <span className={styles.statusTime}>9:41</span>
      <div className={styles.statusIcons}>
        {/* Network Signal */}
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 4H13C13.5523 4 14 4.44772 14 5V11C14 11.5523 13.5523 12 13 12H12C11.4477 12 11 11.5523 11 11V5C11 4.44772 11.4477 4 12 4Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.5 6H8.5C9.05228 6 9.5 6.44772 9.5 7V11C9.5 11.5523 9.05228 12 8.5 12H7.5C6.94772 12 6.5 11.5523 6.5 11V7C6.5 6.44772 6.94772 6 7.5 6Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 7.5H4C4.55228 7.5 5 7.94772 5 8.5V11C5 11.5523 4.55228 12 4 12H3C2.44772 12 2 11.5523 2 11V8.5C2 7.94772 2.44772 7.5 3 7.5Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.5 2H17.5C18.0523 2 18.5 2.44772 18.5 3V11C18.5 11.5523 18.0523 12 17.5 12H16.5C15.9477 12 15.5 11.5523 15.5 11V3C15.5 2.44772 15.9477 2 16.5 2Z"
            fill="white"
            fillOpacity="0.18"
          />
        </svg>
        {/* WiFi */}
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
          <path
            d="M8.133 8.94C8.772 8.94 9.394 9.108 9.941 9.428L10.163 9.558C10.331 9.656 10.361 9.887 10.223 10.024L8.329 11.913C8.213 12.029 8.024 12.029 7.908 11.913L6.026 10.036C5.888 9.899 5.917 9.67 6.084 9.571L6.303 9.441C6.856 9.112 7.485 8.94 8.133 8.94Z"
            fill="white"
          />
          <path
            d="M8.133 5.47C9.724 5.47 11.251 5.997 12.495 6.975L12.671 7.113C12.811 7.223 12.824 7.431 12.697 7.556L11.567 8.684C11.462 8.788 11.297 8.8 11.178 8.712L11.04 8.61C10.2 7.985 9.186 7.65 8.133 7.65C7.073 7.65 6.053 7.989 5.21 8.621L5.072 8.724C4.953 8.813 4.787 8.802 4.682 8.697L3.552 7.57C3.426 7.444 3.438 7.237 3.578 7.127L3.753 6.989C4.999 6.003 6.534 5.47 8.133 5.47Z"
            fill="white"
          />
          <path
            d="M8.133 2C10.657 2 13.072 2.891 14.983 4.523L15.146 4.662C15.278 4.775 15.286 4.976 15.163 5.098L14.036 6.222C13.926 6.331 13.752 6.338 13.634 6.24L13.494 6.123C11.989 4.865 10.104 4.18 8.133 4.18C6.155 4.18 4.263 4.869 2.756 6.135L2.617 6.253C2.498 6.352 2.324 6.345 2.214 6.236L1.087 5.112C0.965 4.99 0.972 4.789 1.104 4.676L1.266 4.537C3.18 2.896 5.601 2 8.133 2Z"
            fill="white"
          />
        </svg>
        {/* Battery */}
        <svg width="25" height="14" viewBox="0 0 25 14" fill="none">
          <path
            d="M24 5C24.5523 5 25 5.44772 25 6V8C25 8.55228 24.5523 9 24 9V5Z"
            fill="white"
            fillOpacity="0.6"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 1H20C21.6569 1 23 2.34315 23 4V10C23 11.6569 21.6569 13 20 13H3C1.34315 13 0 11.6569 0 10V4C0 2.34315 1.34315 1 3 1ZM3 2C1.89543 2 1 2.89543 1 4V10C1 11.1046 1.89543 12 3 12H20C21.1046 12 22 11.1046 22 10V4C22 2.89543 21.1046 2 20 2H3Z"
            fill="white"
            fillOpacity="0.6"
          />
          <rect x="2" y="3" width="19" height="8" rx="1" fill="white" />
        </svg>
      </div>
    </div>
  );
}

function AppBar() {
  return (
    <div className={styles.appBar}>
      <div className={styles.appBarLeft}>
        <button className={styles.backBtn} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z"
              fill="white"
            />
            <path
              d="M10 18L4 12L10 6"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <span className={styles.appBarTitle}>FAQ</span>

      <div className={styles.appBarRight}>
        {/* Notification */}
        <button className={styles.iconBtn} aria-label="Notifications">
          <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path
              d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
            <path
              d="M0 15H18"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
            <path
              d="M7 19H11"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
          <div className={styles.notifBadge}>
            <span className={styles.notifBadgeText}>25</span>
          </div>
        </button>

        {/* Settings */}
        <button className={styles.iconBtn} aria-label="Settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 5C5.89543 5 5 5.89543 5 7V8.17157C5 8.70201 4.78929 9.21071 4.41421 9.58579L3.41421 10.5858C2.63317 11.3668 2.63316 12.6332 3.41421 13.4142L4.41421 14.4142C4.78929 14.7893 5 15.298 5 15.8284V17C5 18.1046 5.89543 19 7 19H8.17157C8.70201 19 9.21071 19.2107 9.58579 19.5858L10.5858 20.5858C11.3668 21.3668 12.6332 21.3668 13.4142 20.5858L14.4142 19.5858C14.7893 19.2107 15.298 19 15.8284 19H17C18.1046 19 19 18.1046 19 17V15.8284C19 15.298 19.2107 14.7893 19.5858 14.4142L20.5858 13.4142C21.3668 12.6332 21.3668 11.3668 20.5858 10.5858L19.5858 9.58579C19.2107 9.21071 19 8.70201 19 8.17157V7C19 5.89543 18.1046 5 17 5H15.8284C15.298 5 14.7893 4.78929 14.4142 4.41421L13.4142 3.41421C12.6332 2.63317 11.3668 2.63316 10.5858 3.41421L9.58579 4.41421C9.21071 4.78929 8.70201 5 8.17157 5H7Z"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M8.5 2.66634V2.16634H7.5V2.66634H8H8.5ZM8 2.66634H7.5L7.5 13.333H8H8.5V2.66634H8Z"
        fill="#131413"
      />
      <path
        d="M12 9.33301L8 13.333L4 9.33301"
        stroke="#131413"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FaqItemProps {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQListItem({ faq, isOpen, onToggle }: FaqItemProps) {
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqHeader} onClick={onToggle}>
        <span className={styles.faqQuestion}>{faq.question}</span>
        <div
          className={`${styles.faqArrow} ${isOpen ? styles.faqArrowOpen : ""}`}
        >
          <ArrowIcon />
        </div>
      </button>

      {faq.answer && (
        <div className={`${styles.faqBody} ${isOpen ? styles.faqBodyOpen : ""}`}>
          <p className={styles.faqAnswer}>
            {faq.answer.map((part, i) =>
              part.highlight ? (
                <span key={i} className={styles.highlight}>
                  {part.text}
                </span>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function BottomNav() {
  return (
    <nav className={styles.bottomNav} aria-label="Main navigation">
      {/* Home */}
      <button className={styles.navItem} aria-label="Home">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 20H4V10L12 4L20 10V20Z"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14V20"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Wallet */}
      <button className={styles.navItem} aria-label="Wallet">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 8H3V20H21V8Z"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 8V4H17V8"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 14H17"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Chart / Trading */}
      <button className={styles.navItem} aria-label="Trading">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4V20H20"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
          <path
            d="M9 13L13 9L16 12L20 8"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Support — Active */}
      <button className={`${styles.navItem} ${styles.navItemActive}`} aria-label="Support" aria-current="page">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z"
            fill="#191919"
          />
          <path
            d="M8 11H8.01"
            stroke="#191919"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11H12.01"
            stroke="#191919"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 11H16.01"
            stroke="#191919"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </nav>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(3);

  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <StatusBar />
        <AppBar />

        <div className={styles.content}>
          {faqs.map((faq) => (
            <FAQListItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => handleToggle(faq.id)}
            />
          ))}
        </div>

        <BottomNav />

        {/* Glow effects */}
        <div className={styles.glowWrap} aria-hidden="true">
          <div className={styles.glowLarge} />
          <div className={styles.glowSmall} />
        </div>
      </div>
    </div>
  );
}
