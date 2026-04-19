import "../home/homeScreen.css";
import "./botDetailScreen.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { hasApiBase } from "../../api/env";
import { fetchTradingJournal, type TradingJournalItem } from "../../api/fetchTradingJournal";
import { botTradingStaticFallback, fetchBotTrading } from "../../api/fetchBotTrading";
import { getStatsForPeriod } from "../../api/parseBotTrading";
import type { BotTradingSnapshot } from "../../api/typesBotTrading";
import { FigmaAppBar } from "../components/FigmaAppBar";
import { FigmaGraphic } from "../components/FigmaGraphic";
import { FigmaStatusBar } from "../components/FigmaStatusBar";
import { FigmaTabBar } from "../components/FigmaTabBar";
import type { StatusBarAssetUrls } from "../types/statusBarAssets";
import type { TabBarIconUrls } from "../types/tabBarIcons";
import { useFmLocale } from "../../i18n/useFmLocale";
import { defaultAppBarAssetUrls } from "../assets/appBarShared";
import { routes } from "../routes";
import { useWalletDisplay } from "../useWalletDisplay";
import { botDetailAssets } from "./botDetailAssets";

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

function formatJournalIso(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

/** Экран «1| Detail Bot» — node 1:3701, 390×1288, `bot-detail__full-screen__1-3701.tsx`. */
export default function BotDetailScreen() {
  const navigate = useNavigate();
  const { t } = useFmLocale();
  const { balanceUsdt: balance } = useWalletDisplay();
  const [tradingFromApi, setTradingFromApi] = useState<BotTradingSnapshot | null>(null);
  const [journalRows, setJournalRows] = useState<TradingJournalItem[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);

  const trading = useMemo(() => {
    if (!tradingFromApi) return botTradingStaticFallback;
    return tradingFromApi;
  }, [tradingFromApi]);

  /** ТЗ: при нулевом балансе данные из торгового журнала; иначе из алгоритма аккаунта. */
  const fromJournal = balance <= 0;
  const [period, setPeriod] = useState<BotPeriod>("24h");
  const [botRunning, setBotRunning] = useState(true);

  useEffect(() => {
    if (!hasApiBase()) return;
    let cancel = false;
    void (async () => {
      const r = await fetchBotTrading(period);
      if (!cancel && r) setTradingFromApi(r);
    })();
    return () => {
      cancel = true;
    };
  }, [period]);

  useEffect(() => {
    if (!hasApiBase()) {
      setJournalRows([]);
      return;
    }
    let cancel = false;
    setJournalLoading(true);
    void (async () => {
      try {
        const { items: rows } = await fetchTradingJournal();
        if (!cancel) setJournalRows(rows);
      } finally {
        if (!cancel) setJournalLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const defaultStat = {
    totalDeals: 78,
    successful: 39,
    unsuccessful: 39,
    profitPercent: -0.72,
  };
  const periodStats = getStatsForPeriod(
    trading,
    period,
    tradingFromApi
      ? { totalDeals: 0, successful: 0, unsuccessful: 0, profitPercent: 0 }
      : (botTradingStaticFallback.byPeriod[period] ?? botTradingStaticFallback.byPeriod["24h"] ?? defaultStat),
  );

  const startDimmed = balance > 0 && botRunning;
  const stopDimmed = balance <= 0 || !botRunning;

  const fmtPct = (n: number) => `${n.toFixed(2)} %`;

  return (
    <main className="fm-bot" data-node-id="1:3701" aria-label={t("bot.ariaScreen")}>
      <FigmaStatusBar assets={botStatusAssets} />

      <FigmaAppBar assets={defaultAppBarAssetUrls} backTo={routes.home} />

      <section className="fm-abs fm-bot-status-panel" aria-label={t("bot.statusAria")}>
        <div className="fm-bot-status-row">
          <p className="fm-bot-caption">{t("bot.statusCaption")}</p>
          <div className="fm-bot-status-live">
            <img alt="" className="fm-bot-dot" src={botDetailAssets.dot} />
            <span className="fm-bot-active-label">{t("bot.active")}</span>
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
          className={`fm-bot-pill fm-bot-pill--start${startDimmed ? " fm-bot-pill--dim" : ""}`}
          onClick={() => {
            if (balance <= 0) navigate(routes.depositTopUp);
            else setBotRunning(true);
          }}
          aria-pressed={balance > 0 && botRunning}
        >
          <span className="fm-bot-pill-icon">
            <img alt="" src={botDetailAssets.iconStart} />
          </span>
          {t("bot.start")}
        </button>

        <button
          type="button"
          className={`fm-bot-pill fm-bot-pill--stop${stopDimmed ? " fm-bot-pill--dim" : ""}`}
          disabled={balance <= 0}
          onClick={() => {
            if (balance <= 0) return;
            setBotRunning(false);
          }}
          aria-pressed={balance > 0 && !botRunning}
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
        <h2 className="fm-bot-feed-title">{fromJournal ? t("bot.feedTitleJournal") : t("bot.feedTitleAlgo")}</h2>

        <div className="fm-bot-feed-cards fm-bot-feed-cards--scroll">
          {!hasApiBase() ? (
            <p className="fm-bot-feed-placeholder">{t("bot.feedNeedApi")}</p>
          ) : journalLoading ? (
            <p className="fm-bot-feed-placeholder">{t("bot.feedLoading")}</p>
          ) : journalRows.length === 0 ? (
            <p className="fm-bot-feed-placeholder">{t("bot.feedEmpty")}</p>
          ) : (
            journalRows.map((row) => {
              const isShort = String(row.side).toLowerCase() === "short";
              return (
                <article key={row.id} className="fm-bot-card">
                  <div className="fm-bot-card-head">
                    {row.status === "open" ? (
                      <span className="fm-bot-card-badge fm-bot-card-badge--muted">
                        <span className="fm-bot-card-badge-inner">
                          <img alt="" src={botDetailAssets.feedFlag} />
                        </span>
                      </span>
                    ) : (
                      <span className="fm-bot-card-badge fm-bot-card-badge--ok">
                        <img alt="" className="fm-bot-check" src={botDetailAssets.feedCheck} />
                      </span>
                    )}
                    <p className="fm-bot-card-title">
                      {row.symbol} · {isShort ? t("bot.journalSideShort") : t("bot.journalSideLong")}
                    </p>
                  </div>
                  <div className="fm-bot-card-line">
                    <span className="fm-bot-card-dim">{t("bot.journalNotional")}</span>
                    <span className="fm-bot-card-plain">{(row.size_minor / 100).toFixed(2)} USDT</span>
                  </div>
                  <div className="fm-bot-card-line">
                    <span className="fm-bot-card-dim">{t("bot.journalOpened")}</span>
                    <span className="fm-bot-card-plain">{formatJournalIso(row.opened_at)}</span>
                  </div>
                  {row.closed_at ? (
                    <div className="fm-bot-card-line">
                      <span className="fm-bot-card-dim">{t("bot.journalClosedAt")}</span>
                      <span className="fm-bot-card-plain">{formatJournalIso(row.closed_at)}</span>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>

      <FigmaTabBar icons={botTabIcons} />
    </main>
  );
}
