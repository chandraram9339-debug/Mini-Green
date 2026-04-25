import { Fragment, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { useAppSession } from "../../session/useAppSession";
import type { MessageKey } from "../../i18n/messages";
import { routes } from "../routes";
import { parseFaqMarkdownSections } from "../../faq/parseFaqMarkdown";

import s from "./faqScreenNew.module.css";

/* ── Active-tab helper ───────────────────────────────────────── */
function useActiveNav() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/bot")) return "bot";
  if (pathname.startsWith("/balance") || pathname.startsWith("/deposit") || pathname.startsWith("/withdraw")) return "wallet";
  if (pathname.startsWith("/support") || pathname.startsWith("/faq")) return "support";
  return "home";
}

/* ── Types ────────────────────────────────────────────────────── */
type FaqItem = { id: string; title: string; body: ReactNode };
type TF = (key: MessageKey, vars?: Record<string, string | number>) => string;

/* ── FAQ data builder (same as old FaqScreen) ────────────────── */
function buildFaqSections(t: TF): { id: string; heading: string; items: FaqItem[] }[] {
  return [
    {
      id: "balance",
      heading: t("faq.sectionBalance"),
      items: [
        {
          id: "withdraw",
          title: t("faq.q.withdraw"),
          body: (
            <>
              <p>{t("faq.a.withdraw.p1")}</p>
              <p>{t("faq.a.withdraw.p2")}</p>
              <p>{t("faq.a.withdraw.p3")}</p>
              <p>
                {t("faq.a.withdraw.attentionBefore")}
                <span className={s.faqAccent}>{t("faq.walletTypeTrc20")}</span>
                {t("faq.a.withdraw.attentionAfter")}
              </p>
              <p>
                {t("faq.a.withdraw.minimumBefore")}
                <span className={s.faqAccent}>{t("faq.a.withdraw.minimumAmount")}</span>
                {t("faq.a.withdraw.minimumAfter")}
              </p>
            </>
          ),
        },
        {
          id: "deposit",
          title: t("faq.q.deposit"),
          body: <p>{t("faq.a.deposit")}</p>,
        },
      ],
    },
    {
      id: "trading",
      heading: t("faq.sectionTrading"),
      items: [
        {
          id: "bot",
          title: t("faq.q.howBot"),
          body: <p>{t("faq.a.howBot")}</p>,
        },
        {
          id: "fees",
          title: t("faq.q.fees"),
          body: <p>{t("faq.a.fees")}</p>,
        },
      ],
    },
    {
      id: "more",
      heading: t("faq.sectionMore"),
      items: [
        {
          id: "referral",
          title: t("faq.q.referral"),
          body: <p>{t("faq.a.referral")}</p>,
        },
        {
          id: "security",
          title: t("faq.q.security"),
          body: <p>{t("faq.a.security")}</p>,
        },
      ],
    },
  ];
}

/** Ответ из Markdown: абзацы по пустой строке, **жирный**. */
function FaqPlainBody({ text }: { text: string }) {
  const paras = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <>
      {paras.map((para, i) => (
        <p key={i} className={s.faqAnswerP}>
          {formatInlineBold(para)}
        </p>
      ))}
    </>
  );
}

function formatInlineBold(str: string): ReactNode {
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    const m = p.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <strong key={i} className={s.faqStrong}>
          {m[1]}
        </strong>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

/* ── Chevron: collapsed (blue, pointing right →) ────────────── */
function ChevronCollapsed() {
  return (
    <div className={s.chevronCollapsed}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8.5 2.667V2.167H7.5v.5H8h.5ZM8 2.667H7.5L7.5 13.333H8h.5V2.667H8Z" fill="white"/>
        <path d="M12 9.333L8 13.333 4 9.333" stroke="white" strokeLinecap="square" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ── Chevron: expanded (mint, pointing up ↑) ─────────────────── */
function ChevronExpanded() {
  return (
    <div className={s.chevronExpanded}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7.285 11.428V11.857H6.428V11.428h.429h.428ZM6.857 11.428H6.428L6.428 2.286h.429h.428L7.285 11.428H6.857Z" fill="white"/>
        <path d="M10.285 5.714L6.857 2.286 3.428 5.714" stroke="white" strokeWidth="0.857" strokeLinecap="square" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ── AppBar ──────────────────────────────────────────────────── */
function AppBar({ title, bellCount }: { title: string; bellCount: number }) {
  const navigate = useNavigate();
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        <button
          className={s.appBarBack}
          onClick={() => navigate(routes.support)}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#55647B"/>
            <path d="M10 18L4 12L10 6" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </button>

        <span className={s.appBarTitle}>{title}</span>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={s.appBarBell} aria-label="Notifications">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.143 2.738 3.363 4.05 2.05C5.363.738 7.143 0 9 0c1.857 0 3.637.738 4.95 2.05C15.263 3.363 16 5.143 16 7v8" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M0 15H18" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M7 19H11" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
            {bellCount > 0 && (
              <span className={s.appBarBellBadge}><span>{bellCount > 99 ? "99+" : bellCount}</span></span>
            )}
          </Link>
          <Link to={routes.settings} className={s.appBarGear} aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 5C5.895 5 5 5.895 5 7v1.172c0 .53-.211 1.04-.586 1.414l-1 1C2.633 11.367 2.633 12.633 3.414 13.414l1 1C4.789 14.789 5 15.298 5 15.828V17c0 1.105.895 2 2 2h1.172c.53 0 1.04.211 1.414.586l1 1C11.367 21.367 12.633 21.367 13.414 20.586l1-1C14.789 19.211 15.298 19 15.828 19H17c1.105 0 2-.895 2-2v-1.172c0-.53.211-1.04.586-1.414l1-1c.781-.781.781-2.047 0-2.828l-1-1A2 2 0 0 1 19 8.172V7c0-1.105-.895-2-2-2h-1.172c-.53 0-1.04-.211-1.414-.586l-1-1C12.633 2.633 11.367 2.633 10.586 3.414l-1 1A2 2 0 0 1 8.172 5H7Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
      <div className={s.appBarDivider} />
    </header>
  );
}

/* ── Bottom TabBar ───────────────────────────────────────────── */
function BottomTabBar({ active }: { active: string }) {
  const tabs = [
    {
      id: "home", to: routes.home, label: "Home",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 20H4V10L12 4L20 10V20Z" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 14V20" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "wallet", to: routes.balanceDeposit, label: "Wallet",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 8H3V20H21V8Z" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 8V4H17V8" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 14H17" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "bot", to: routes.bot, label: "Bot",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 4V20H20" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          <path d="M9 13L13 9L16 12L20 8" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "support", to: routes.support, label: "Support",
      icon: (a: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2c0 .324.195.615.694.739.299.124.637.06.866-.169L3 21ZM6 18V17.2H5.669l-.235.235L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21l.566.566 3-3L6 18l-.435-.435-3 3L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill={a ? "#fff" : "#55647B"}/>
          <path d="M8 11H8.01M12 11H12.01M16 11H16.01" stroke={a ? "#fff" : "#55647B"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ] as const;

  return (
    <nav className={s.tabBar} aria-label="Primary navigation">
      <div className={s.tabBarInner}>
        {tabs.map(({ id, to, label, icon }) => {
          const isActive = active === id;
          return (
            <Link
              key={id}
              to={to}
              className={s.tabItem}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={`${s.tabItemIcon}${isActive ? ` ${s.tabItemIconActive}` : ""}`}>
                {icon(isActive)}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ── Main Screen ─────────────────────────────────────────────── */
export default function FaqScreenNew() {
  const { t } = useFmLocale();
  const activeNav = useActiveNav();
  const { notificationUnreadCount, uiSettings, wallet } = useAppSession();

  const faqRaw = (uiSettings?.faq_markdown ?? wallet?.faq_markdown ?? "").trim();
  const sectionsFromServer = useMemo(
    () => (faqRaw ? parseFaqMarkdownSections(faqRaw) : []),
    [faqRaw]
  );
  const hasServerFaq = sectionsFromServer.some((sec) => sec.items.length > 0);

  const faqSections = useMemo(() => buildFaqSections(t), [t]);

  /* Single-open accordion — same state shape as old FaqScreen */
  const [openId, setOpenId] = useState<string>("withdraw");

  useEffect(() => {
    if (hasServerFaq) {
      const first = sectionsFromServer[0]?.items[0]?.id;
      if (first) setOpenId(first);
    } else {
      setOpenId("withdraw");
    }
  }, [hasServerFaq, faqRaw, sectionsFromServer]);

  return (
    <div className={s.screen} aria-label={t("faq.title")}>
      <AppBar title={t("faq.title")} bellCount={notificationUnreadCount} />

      <div className={s.body}>
        <div className={s.list}>
          {hasServerFaq
            ? sectionsFromServer.map((section, si) => (
                <Fragment key={`${section.heading}-${si}`}>
                  <h2 className={s.sectionHeading}>{section.heading}</h2>
                  {section.items.map((item) => {
                    const expanded = openId === item.id;
                    return (
                      <article key={item.id} className={s.faqCard}>
                        <button
                          type="button"
                          className={s.faqBtn}
                          aria-expanded={expanded}
                          onClick={() => setOpenId(expanded ? "" : item.id)}
                        >
                          <p className={s.faqQuestion}>{item.q}</p>
                          {expanded ? <ChevronExpanded /> : <ChevronCollapsed />}
                        </button>
                        {expanded && (
                          <div className={s.faqAnswer}>
                            <FaqPlainBody text={item.a} />
                          </div>
                        )}
                      </article>
                    );
                  })}
                </Fragment>
              ))
            : faqSections.map((section) => (
                <Fragment key={section.id}>
                  <h2 className={s.sectionHeading}>{section.heading}</h2>

                  {section.items.map((item) => {
                    const expanded = openId === item.id;
                    return (
                      <article key={item.id} className={s.faqCard}>
                        <button
                          type="button"
                          className={s.faqBtn}
                          aria-expanded={expanded}
                          onClick={() => setOpenId(expanded ? "" : item.id)}
                        >
                          <p className={s.faqQuestion}>{item.title}</p>
                          {expanded ? <ChevronExpanded /> : <ChevronCollapsed />}
                        </button>

                        {expanded && (
                          <div className={s.faqAnswer}>{item.body}</div>
                        )}
                      </article>
                    );
                  })}
                </Fragment>
              ))}
        </div>
      </div>

      <BottomTabBar active={activeNav} />
    </div>
  );
}
