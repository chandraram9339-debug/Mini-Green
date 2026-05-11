import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import { useDemoStore } from "../../stores/demoStore";
import { useAppSession } from "../../session/useAppSession";
import { readTgUserIdForMemo } from "../../telegram/tgUserId";
import { TonTopUpBlock } from "../../ton/TonTopUpBlock";
import { hapticLight } from "../../telegram/uiFeedback";

import s from "./demoTopUpScreen.module.css";

const PRESET_USD = [500, 1000, 2500, 5000, 10_000] as const;

type DemoMethod = "choose" | "virtual" | "ton";

export default function DemoTopUpScreen() {
  const { t } = useFmLocale();
  const navigate = useNavigate();
  const creditDemoFunds = useDemoStore((s) => s.creditDemoFunds);
  const resetDemoAccount = useDemoStore((s) => s.resetDemoAccount);
  const setDemoMode = useDemoStore((s) => s.setDemoMode);
  const demoTotalDepositedUsdt = useDemoStore((s) => s.demoTotalDepositedUsdt);
  const { wallet } = useAppSession();
  const tgMemo = useMemo(() => readTgUserIdForMemo(), []);

  const [method, setMethod] = useState<DemoMethod>("choose");
  const [selected, setSelected] = useState<number>(PRESET_USD[1]);
  const presetsLocked = demoTotalDepositedUsdt > 0;

  const formattedPresets = useMemo(
    () => PRESET_USD.map((n) => ({ value: n, label: `$${n.toLocaleString("en-US")}` })),
    [],
  );

  const leaveToHome = () => {
    if (demoTotalDepositedUsdt <= 0) setDemoMode(false);
    navigate(routes.home);
  };

  const handleHeaderBack = () => {
    if (method !== "choose") {
      hapticLight();
      setMethod("choose");
      return;
    }
    leaveToHome();
  };

  const selectMethod = (next: DemoMethod) => {
    hapticLight();
    setMethod(next);
  };

  const onGetFunds = () => {
    if (presetsLocked) return;
    creditDemoFunds(selected);
    navigate(routes.home);
  };

  const onReset = () => {
    resetDemoAccount();
  };

  return (
    <div className={s.page}>
      <header className={s.header}>
        <button type="button" className={s.backBtn} onClick={handleHeaderBack} aria-label={t("common.back")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="currentColor" />
            <path
              d="M10 18L4 12L10 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className={s.title}>{t("demo.topUpTitle")}</h1>
      </header>

      {method === "choose" ? (
        <section className={s.methodChooser} aria-label={t("demo.chooseMethodTitle")}>
          <h2 className={s.heroTitle}>{t("demo.chooseMethodTitle")}</h2>
          <p className={s.heroSubtitle}>{t("demo.chooseMethodSubtitle")}</p>

          <div className={s.methodGrid}>
            <button
              type="button"
              className={`${s.methodCard} ${s.methodCardPrimary}`}
              onClick={() => selectMethod("virtual")}
            >
              <span className={s.methodIcon} aria-hidden>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="4" y="6" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 14h16M12 20h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="28" cy="24" r="4" fill="currentColor" opacity="0.35" />
                </svg>
              </span>
              <span className={s.methodCardTitle}>{t("demo.methodVirtualTitle")}</span>
              <span className={s.methodCardDesc}>{t("demo.methodVirtualSubtitle")}</span>
            </button>

            <button type="button" className={s.methodCard} onClick={() => selectMethod("ton")}>
              <span className={s.methodIcon} aria-hidden>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path
                    d="M20 6L8 12v8l12 6 12-6v-8L20 6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path d="M20 20v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className={s.methodCardTitle}>{t("demo.methodTonTitle")}</span>
              <span className={s.methodCardDesc}>{t("demo.methodTonSubtitle")}</span>
            </button>
          </div>
        </section>
      ) : null}

      {method === "virtual" ? (
        <section className={s.stepFlow} aria-label={t("demo.virtualStepTitle")}>
          <button type="button" className={s.stepBack} onClick={() => selectMethod("choose")}>
            ← {t("demo.changeMethod")}
          </button>
          <h2 className={s.stepTitle}>{t("demo.virtualStepTitle")}</h2>
          <p className={s.stepLead}>{t("demo.topUpLead")}</p>

          {presetsLocked ? (
            <div className={s.lockedBanner}>
              <p className={s.lockedHint}>{t("demo.topUpLockedHint")}</p>
              <button type="button" className={s.resetBannerBtn} onClick={onReset}>
                {t("demo.resetDemoOnTopUp")}
              </button>
            </div>
          ) : null}

          <div className={s.grid} role="list">
            {formattedPresets.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="listitem"
                disabled={presetsLocked}
                className={`${s.card}${selected === value ? ` ${s.cardSelected}` : ""}${
                  presetsLocked ? ` ${s.cardLocked}` : ""
                }`}
                onClick={() => {
                  if (presetsLocked) return;
                  setSelected(value);
                }}
                aria-pressed={selected === value}
              >
                <span className={s.cardAmount}>{label}</span>
                <span className={s.cardHint}>{t("demo.virtualUsdt")}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`${s.primaryBtn}${presetsLocked ? ` ${s.primaryBtnDisabled}` : ""}`}
            onClick={onGetFunds}
            disabled={presetsLocked}
          >
            {t("demo.getFunds")}
          </button>
        </section>
      ) : null}

      {method === "ton" ? (
        <section className={s.tonStepFlow} aria-label={t("demo.tonStepTitle")}>
          <button type="button" className={s.stepBack} onClick={() => selectMethod("choose")}>
            ← {t("demo.changeMethod")}
          </button>
          <h2 className={s.stepTitle}>{t("demo.tonStepTitle")}</h2>
          <p className={s.tonIntro}>{t("demo.tonStepIntro")}</p>

          <div className={s.tonPanel}>
            <TonTopUpBlock
              wrapClassName={s.tonBlockInner}
              primaryButtonClassName={`${s.tonActionBtn} ${s.tonActionPrimary}`}
              secondaryButtonClassName={`${s.tonActionBtn} ${s.tonActionSecondary}`}
              buttonClassName={`${s.tonActionBtn} ${s.tonActionPrimary}`}
              tonCentralAddress={wallet?.centralTonDepositAddress}
              jettonMaster={wallet?.tonUsdtJettonMaster}
              tgComment={tgMemo}
              demoHint
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
