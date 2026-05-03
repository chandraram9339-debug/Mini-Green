import { Fragment, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { useAppSession } from "../../session/useAppSession";
import { routes } from "../routes";
import { parseFaqMarkdownSections } from "../../faq/parseFaqMarkdown";
import { FAQ_DEFAULT_PALLADIUM_MARKDOWN } from "../../faq/faqDefaultPalladiumMarkdown";
import { FAQ_DEFAULT_PALLADIUM_MARKDOWN_ES } from "../../faq/faqDefaultPalladiumMarkdownEs";

import s from "./faqScreenNew.module.css";

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
        <path d="M8.5 2.667V2.167H7.5v.5H8h.5ZM8 2.667H7.5L7.5 13.333H8h.5V2.667H8Z" fill="#131413"/>
        <path d="M12 9.333L8 13.333 4 9.333" stroke="#131413" strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ── Chevron: expanded (mint, pointing up ↑) ─────────────────── */
function ChevronExpanded() {
  return (
    <div className={s.chevronExpanded}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7.285 11.428V11.857H6.428V11.428h.429h.428ZM6.857 11.428H6.428L6.428 2.286h.429h.428L7.285 11.428H6.857Z" fill="#131413"/>
        <path d="M10.285 5.714L6.857 2.286 3.428 5.714" stroke="#131413" strokeWidth="0.857" strokeLinecap="square" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ── AppBar ──────────────────────────────────────────────────── */
function AppBar({ title, bellCount, onBack }: { title: string; bellCount: number; onBack: () => void }) {
  return (
    <header className={s.appBar}>
      <div className={s.appBarRow}>
        <button
          type="button"
          className={`${s.appBarBack} fm-appbar-hit-dark`}
          onClick={onBack}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#ffffff"/>
            <path d="M10 18L4 12L10 6" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </button>

        <span className={s.appBarTitle}>{title}</span>

        <div className={s.appBarIcons}>
          <Link to={routes.notifications} className={`${s.appBarBell} fm-appbar-hit-dark`} aria-label="Notifications">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
              <path d="M2 15V7C2 5.143 2.738 3.363 4.05 2.05C5.363.738 7.143 0 9 0c1.857 0 3.637.738 4.95 2.05C15.263 3.363 16 5.143 16 7v8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M0 15H18" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M7 19H11" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
            {bellCount > 0 && (
              <span className={s.appBarBellBadge}><span>{bellCount > 99 ? "99+" : bellCount}</span></span>
            )}
          </Link>
          <Link to={routes.settings} className={`${s.appBarGear} fm-appbar-hit-dark`} aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 5C5.895 5 5 5.895 5 7v1.172c0 .53-.211 1.04-.586 1.414l-1 1C2.633 11.367 2.633 12.633 3.414 13.414l1 1C4.789 14.789 5 15.298 5 15.828V17c0 1.105.895 2 2 2h1.172c.53 0 1.04.211 1.414.586l1 1C11.367 21.367 12.633 21.367 13.414 20.586l1-1C14.789 19.211 15.298 19 15.828 19H17c1.105 0 2-.895 2-2v-1.172c0-.53.211-1.04.586-1.414l1-1c.781-.781.781-2.047 0-2.828l-1-1A2 2 0 0 1 19 8.172V7c0-1.105-.895-2-2-2h-1.172c-.53 0-1.04-.211-1.414-.586l-1-1C12.633 2.633 11.367 2.633 10.586 3.414l-1 1A2 2 0 0 1 8.172 5H7Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
      <div className={s.appBarDivider} />
    </header>
  );
}

/* ── Main Screen ─────────────────────────────────────────────── */
export default function FaqScreenNew() {
  const { t, locale } = useFmLocale();
  const { notificationUnreadCount, uiSettings, wallet } = useAppSession();

  const bundledDefault = locale === "es" ? FAQ_DEFAULT_PALLADIUM_MARKDOWN_ES : FAQ_DEFAULT_PALLADIUM_MARKDOWN;
  /** Для `es` — отдельное поле в админке / wallet; иначе общий markdown (EN). */
  const serverFields =
    locale === "es"
      ? [uiSettings?.faq_markdown_es, wallet?.faq_markdown_es]
      : [uiSettings?.faq_markdown, wallet?.faq_markdown];
  const faqRaw =
    serverFields.map((s) => (typeof s === "string" ? s.trim() : "")).find((s) => s.length > 0) ?? "";
  /** FAQ.md / FAQ.es.md в бандле; админка перекрывает по языку. */
  const effectiveFaq = faqRaw || bundledDefault;
  const sections = useMemo(() => {
    const parsed = parseFaqMarkdownSections(effectiveFaq);
    const ok = parsed.some((sec) => sec.items.length > 0);
    if (ok) return parsed;
    return parseFaqMarkdownSections(bundledDefault);
  }, [effectiveFaq, bundledDefault]);

  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string>("");
  const [sectionIndex, setSectionIndex] = useState<number | null>(null);

  useEffect(() => {
    setOpenId("");
    setSectionIndex(null);
  }, [effectiveFaq]);

  const atSectionList = sectionIndex === null;
  const appBarTitle = atSectionList ? t("faq.title") : sections[sectionIndex]?.heading ?? t("faq.title");

  const onAppBarBack = () => {
    if (atSectionList) navigate(routes.support);
    else {
      setSectionIndex(null);
      setOpenId("");
    }
  };

  return (
    <div className={s.screen} aria-label={t("faq.title")}>
      <AppBar title={appBarTitle} bellCount={notificationUnreadCount} onBack={onAppBarBack} />

      <div className={s.body}>
        <div className={s.list}>
          {atSectionList &&
            sections.map((sec, si) => (
              <article key={`sec-${si}-${sec.heading}`} className={s.faqCard}>
                <button type="button" className={s.sectionHeaderBtn} onClick={() => setSectionIndex(si)}>
                  <p className={s.sectionHeaderTitle}>{sec.heading}</p>
                  <ChevronCollapsed />
                </button>
              </article>
            ))}

          {!atSectionList &&
            sections[sectionIndex!]?.items.map((item) => {
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
        </div>
      </div>
    </div>
  );
}
