import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useFmLocale } from "../../i18n/useFmLocale";
import { routes } from "../routes";
import { useDemoStore } from "../../stores/demoStore";
import { useAppSession } from "../../session/useAppSession";
import { readTgUserIdForMemo } from "../../telegram/tgUserId";
import { TonTopUpBlock } from "../../ton/TonTopUpBlock";

import s from "./demoTopUpScreen.module.css";

const PRESET_USD = [500, 1000, 2500, 5000, 10_000] as const;

export default function DemoTopUpScreen() {
  const { t } = useFmLocale();
  const navigate = useNavigate();
  const creditDemoFunds = useDemoStore((s) => s.creditDemoFunds);
  const resetDemoAccount = useDemoStore((s) => s.resetDemoAccount);
  const setDemoMode = useDemoStore((s) => s.setDemoMode);
  const demoTotalDepositedUsdt = useDemoStore((s) => s.demoTotalDepositedUsdt);
  const { wallet } = useAppSession();
  const tgMemo = useMemo(() => readTgUserIdForMemo(), []);

  const [selected, setSelected] = useState<number>(PRESET_USD[1]);
  const presetsLocked = demoTotalDepositedUsdt > 0;

  const formattedPresets = useMemo(
    () => PRESET_USD.map((n) => ({ value: n, label: `$${n.toLocaleString("en-US")}` })),
    [],
  );

  const onBack = () => {
    if (demoTotalDepositedUsdt <= 0) setDemoMode(false);
    navigate(routes.home);
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
        <button type="button" className={s.backBtn} onClick={onBack} aria-label={t("common.back")}>
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

      <p className={s.lead}>{t("demo.topUpLead")}</p>

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

      <div className={s.tonBlock}>
        <TonTopUpBlock
          wrapClassName={s.tonBlockInner}
          buttonClassName={s.tonBtn}
          tonCentralAddress={wallet?.centralTonDepositAddress}
          jettonMaster={wallet?.tonUsdtJettonMaster}
          tgComment={tgMemo}
          demoHint
        />
      </div>
    </div>
  );
}
