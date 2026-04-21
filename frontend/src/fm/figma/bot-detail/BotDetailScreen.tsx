import "../home/homeScreen.css";
import "./botDetailScreen.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { hasApiBase } from "../../api/env";
import {
  fetchTradingJournal,
  type TradingJournalItem,
  type TradingJournalMeta,
} from "../../api/fetchTradingJournal";
import { botTradingStaticFallback, fetchBotTrading } from "../../api/fetchBotTrading";
import { getStatsForPeriod } from "../../api/parseBotTrading";
import { setBotTradingState } from "../../api/setBotTradingState";
import type { BotTradingSnapshot } from "../../api/typesBotTrading";
import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaGraphic } from "../components/FigmaGraphic";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import { buildCompoundedChartPoints } from "../components/tradingChartPoints";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { useFmLocale } from "../../i18n/useFmLocale";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { routes } from "../routes";
import { useAppSession } from "../../session/useAppSession";
import { useWalletDisplay } from "../useWalletDisplay";
import { botDetailAssets } from "./botDetailAssets";
import { BotJournalTradeCard } from "./BotJournalTradeCard";

const botStatusAssets: StatusBarAssetUrls = {
  networkSignalLight: botDetailAssets.networkSignalLight,
  wifiSignalLight: botDetailAssets.wifiSignalLight,
  batteryLight: botDetailAssets.batteryLight,
  indicator: botDetailAssets.indicator,
  time941: botDetailAssets.time941,
};

const botTabIcons: TabBarIconUrls = {
  home: botDetailAssets.group4,
  wallet: botDetailAssets.group5,
  bot: botDetailAssets.group6,
  support: botDetailAssets.group7,
};

type BotPeriod = "24h" | "3d" | "7d" | "1m";
type TradeResultFilter = "all" | "positive" | "negative";

/** Интервал обновления журнала и статистики на экране (мс). Env: VITE_BOT_DETAIL_REFRESH_MS, мин. 2 с. */
function botDetailRefreshMs(): number {
  const raw = import.meta.env.VITE_BOT_DETAIL_REFRESH_MS;
  if (raw == null || String(raw).trim() === "") return 5_000;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 2_000 ? n : 5_000;
}

/** Экран «1| Detail Bot» — node 1:3701, 390×1288, `bot-detail__full-screen__1-3701.tsx`. */
export default function BotDetailScreen() {
  const navigate = useNavigate();
  const { t } = useFmLocale();
  const { phase, botRunning, refreshWallet, setBotRunning } = useAppSession();
  const { balanceUsdt: balance } = useWalletDisplay();
  const [tradingFromApi, setTradingFromApi] = useState<BotTradingSnapshot | null>(null);
  const [journalRows, setJournalRows] = useState<TradingJournalItem[]>([]);
  const [journalMeta, setJournalMeta] = useState<TradingJournalMeta | null>(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [botSwitchLoading, setBotSwitchLoading] = useState(false);

  const trading = useMemo(() => {
    if (!tradingFromApi) return botTradingStaticFallback;
    return tradingFromApi;
  }, [tradingFromApi]);

  /** ТЗ: при нулевом балансе данные из торгового журнала; иначе из алгоритма аккаунта. */
  const fromJournal = balance <= 0;
  const [period, setPeriod] = useState<BotPeriod>("24h");
  const [tradeResultFilter, setTradeResultFilter] = useState<TradeResultFilter>("all");

  const apiSessionReady = !hasApiBase() || phase === "ready";
  /** Пока сессия не готова (идёт auth), не показываем ложное «пусто»; при error не блокируем ленту бесконечным спиннером. */
  const feedWaitingForSession =
    hasApiBase() && (phase === "idle" || phase === "bootstrapping");

  /** Первый запрос + постоянный refetch (журнал и сводка по текущему периоду), пока экран открыт. */
  useEffect(() => {
    if (!hasApiBase()) {
      setJournalRows([]);
      setJournalMeta(null);
      return;
    }
    if (!apiSessionReady) return;

    let cancelled = false;
    const refreshMs = botDetailRefreshMs();

    const load = async (showSpinner: boolean) => {
      if (showSpinner) {
        setJournalLoading(true);
        setJournalRows([]);
        setJournalMeta(null);
      }
      try {
        const [jr, snap] = await Promise.all([
          fetchTradingJournal(100, period),
          fetchBotTrading(period),
        ]);
        if (cancelled) return;
        setJournalRows(jr.items);
        setJournalMeta(jr.meta);
        if (snap) setTradingFromApi(snap);
      } finally {
        if (showSpinner && !cancelled) setJournalLoading(false);
      }
    };

    void load(true);
    const intervalId = window.setInterval(() => void load(false), refreshMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [apiSessionReady, period]);

  const defaultStat = {
    totalDeals: 78,
    successful: 39,
    unsuccessful: 39,
    profitPercent: -0.72,
    neutral: 0,
    openInPeriod: 0,
    closedWithoutResult: 0,
  };
  const zeroStat = {
    totalDeals: 0,
    successful: 0,
    unsuccessful: 0,
    profitPercent: 0,
    neutral: 0,
    openInPeriod: 0,
    closedWithoutResult: 0,
  };
  const periodStats = useMemo(() => {
    const ps = journalMeta?.period_stats;
    const pf = journalMeta?.period_filter;
    if (ps != null && (pf == null || pf === "" || pf === period)) {
      return ps;
    }
    return getStatsForPeriod(
      trading,
      period,
      tradingFromApi
        ? zeroStat
        : (botTradingStaticFallback.byPeriod[period] ??
            botTradingStaticFallback.byPeriod["24h"] ??
            defaultStat),
    );
  }, [journalMeta, period, trading, tradingFromApi]);
  const chartPoints = useMemo(() => buildCompoundedChartPoints(journalRows), [journalRows]);
  const filteredJournalRows = useMemo(() => {
    if (tradeResultFilter === "all") return journalRows;
    return journalRows.filter((row) => {
      if (row.status !== "closed") return false;
      const rp = row.result_percent;
      if (tradeResultFilter === "positive") return rp != null && rp > 0;
      return rp == null || rp <= 0;
    });
  }, [journalRows, tradeResultFilter]);

  const isBotActive = balance > 0 && botRunning;
  const startDimmed = isBotActive;
  const stopDimmed = !isBotActive;

  const fmtPct = (n: number) => `${n.toFixed(2)} %`;

  async function applyBotState(enabled: boolean): Promise<void> {
    if (balance <= 0 && enabled) {
      navigate(routes.depositTopUp);
      return;
    }

    if (!hasApiBase()) {
      setBotRunning(enabled);
      return;
    }

    setBotSwitchLoading(true);
    try {
      const result = await setBotTradingState(enabled);
      if (!result.ok) return;
      setBotRunning(result.botTradingEnabled ?? enabled);
      await refreshWallet();
    } finally {
      setBotSwitchLoading(false);
    }
  }

  return (
    <main className="fm-bot" data-node-id="1:3701" aria-label={t("bot.ariaScreen")}>
      <FigmaStatusBar assets={botStatusAssets} />

      <FigmaAppBar assets={defaultAppBarAssetUrls} backTo={routes.home} showLogo />

      <section className="fm-abs fm-bot-status-panel" aria-label={t("bot.statusAria")}>
        <div className="fm-bot-status-row">
          <p className="fm-bot-caption">{t("bot.statusCaption")}</p>
          <div className={`fm-bot-status-live${isBotActive ? "" : " fm-bot-status-live--inactive"}`}>
            <span className="fm-bot-dot" aria-hidden="true" />
            <span className="fm-bot-active-label">{isBotActive ? t("bot.active") : t("bot.inactive")}</span>
          </div>
        </div>

        <div className="fm-bot-price-row">
          <p className="fm-bot-caption">{t("bot.actualPriceCaption")}</p>
          <div className="fm-bot-price-amt">
            <span className="fm-bot-price-num">{trading.displayPrice}</span>
            <span className="fm-bot-price-unit">
              {tradingFromApi ? trading.pricePair : t("bot.pairBtc")}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={`fm-bot-pill fm-bot-pill--start${startDimmed || botSwitchLoading ? " fm-bot-pill--dim" : ""}`}
          onClick={() => void applyBotState(true)}
          aria-pressed={isBotActive}
          disabled={botSwitchLoading}
        >
          <span className="fm-bot-pill-icon">
            <img alt="" src={botDetailAssets.iconStart} />
          </span>
          {t("bot.start")}
        </button>

        <button
          type="button"
          className={`fm-bot-pill fm-bot-pill--stop${stopDimmed || botSwitchLoading ? " fm-bot-pill--dim" : ""}`}
          disabled={!isBotActive || botSwitchLoading}
          onClick={() => void applyBotState(false)}
          aria-pressed={balance > 0 && !isBotActive}
        >
          <span className="fm-bot-pill-icon fm-bot-pill-icon--stop">
            <img alt="" src={botDetailAssets.iconStop} />
          </span>
          {t("bot.stop")}
        </button>
      </section>

      <div
        className="fm-abs fm-bot-chart-shell"
        data-bot-chart={fromJournal ? "journal" : "algorithm"}
        aria-label={fromJournal ? t("bot.chartAriaJournal") : t("bot.chartAriaAlgo")}
      >
        <FigmaGraphic
          chart={{
            vector25: botDetailAssets.vector25,
            line: botDetailAssets.line1,
          }}
          points={chartPoints}
          animate={isBotActive}
        />
      </div>

      <section
        className="fm-abs fm-bot-period-stats"
        aria-label={fromJournal ? t("bot.statsAriaJournal") : t("bot.statsAriaAlgo")}
      >
        <h2 className="fm-bot-period-title">{t("bot.periodTitle")}</h2>

        <div className="fm-bot-period-tabs" role="tablist" aria-label={t("bot.periodTabsAria")}>
          {(
            [
              ["24h", "24h"],
              ["3d", "3d"],
              ["7d", "7d"],
              ["1m", "1m"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={period === key}
              className={`fm-bot-stat-tab${period === key ? " fm-bot-stat-tab--on" : ""}`}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="fm-bot-period-card">
          <div className="fm-bot-stat-row">
            <span className="fm-bot-stat-ico">
              <img alt="" src={botDetailAssets.statTotalDeals} />
            </span>
            <span className="fm-bot-stat-label">{t("bot.statTotalDeals")}</span>
            <span className="fm-bot-stat-val">{periodStats.totalDeals}</span>
          </div>
          <div className="fm-bot-stat-row">
            <span className="fm-bot-stat-ico">
              <img alt="" src={botDetailAssets.statSuccess} />
            </span>
            <span className="fm-bot-stat-label">{t("bot.statSuccessful")}</span>
            <span className="fm-bot-stat-val">{periodStats.successful}</span>
          </div>
          <div className="fm-bot-stat-row">
            <span className="fm-bot-stat-ico fm-bot-stat-ico--fail">
              <img alt="" src={botDetailAssets.statUnsuccess} />
            </span>
            <span className="fm-bot-stat-label">{t("bot.statUnsuccessful")}</span>
            <span className="fm-bot-stat-val">{periodStats.unsuccessful}</span>
          </div>
          <div className="fm-bot-stat-row">
            <span className="fm-bot-stat-ico fm-bot-stat-ico--profit-trend">
              <img alt="" src={botDetailAssets.statProfitTrend} />
            </span>
            <span className="fm-bot-stat-label">{t("bot.statProfitPct")}</span>
            <span className="fm-bot-stat-val">{fmtPct(periodStats.profitPercent)}</span>
          </div>
        </div>
      </section>

      <section
        className="fm-abs fm-bot-trading-feed"
        aria-label={fromJournal ? t("bot.feedAriaJournal") : t("bot.feedAriaAlgo")}
      >
        <h2 className="fm-bot-feed-title">{t("bot.feedTitleAlgo")}</h2>
        <div className="fm-bot-feed-filters" role="tablist" aria-label={t("bot.feedFilterAria")}>
          {(
            [
              ["all", t("bot.feedFilterAll")],
              ["positive", t("bot.feedFilterPositive")],
              ["negative", t("bot.feedFilterNegative")],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tradeResultFilter === key}
              className={`fm-bot-feed-filter${tradeResultFilter === key ? " fm-bot-feed-filter--on" : ""}`}
              onClick={() => setTradeResultFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="fm-bot-feed-cards fm-bot-feed-cards--scroll">
          {!hasApiBase() ? (
            <p className="fm-bot-feed-placeholder">{t("bot.feedNeedApi")}</p>
          ) : feedWaitingForSession ? (
            <p className="fm-bot-feed-placeholder">{t("bot.feedLoading")}</p>
          ) : journalLoading ? (
            <p className="fm-bot-feed-placeholder">{t("bot.feedLoading")}</p>
          ) : journalRows.length === 0 ? (
            <p className="fm-bot-feed-placeholder">{t("bot.feedEmpty")}</p>
          ) : filteredJournalRows.length === 0 ? (
            <p className="fm-bot-feed-placeholder">{t("bot.feedFilterEmpty")}</p>
          ) : (
            <>
              {filteredJournalRows.map((row) => (
                <BotJournalTradeCard key={row.id} row={row} t={t} />
              ))}
            </>
          )}
        </div>
      </section>

      <FigmaTabBar icons={botTabIcons} />
    </main>
  );
}
