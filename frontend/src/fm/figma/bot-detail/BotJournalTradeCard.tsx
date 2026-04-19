import type { TradingJournalItem } from "../../api/fetchTradingJournal";
import type { MessageKey } from "../../i18n/messages";
import { botDetailAssets } from "./botDetailAssets";

type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function formatSymbolLabel(symbol: string): string {
  const u = symbol.toUpperCase().replace(/\s+/g, "");
  if (u.endsWith("USDT") && u.length > 4) {
    const base = u.slice(0, -4);
    return `${base} / USDT`;
  }
  return symbol.trim() || "—";
}

function formatUnitLabel(symbol: string): string {
  const u = symbol.toUpperCase().replace(/\s+/g, "");
  if (u.endsWith("USDT") && u.length > 4) {
    const base = u.slice(0, -4);
    return `USDT/${base}`;
  }
  return "USDT/BTC";
}

function fmtPriceQuote(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).replace(/,/g, " ");
  }
  return n.toFixed(n >= 1 ? 4 : 6);
}

function fmtPctAbs(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${Math.abs(n).toFixed(2)} %`;
}

function formatJournalIso(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
  } catch {
    return iso;
  }
}

/** Карточки журнала: успех (node 1:3383), убыток (1:3395), открытая (1:3407). */
export function BotJournalTradeCard({ row, t }: { row: TradingJournalItem; t: TFn }) {
  const isShort = String(row.side).toLowerCase() === "short";
  const closed = row.status === "closed";
  const rp = row.result_percent;
  const unit = formatUnitLabel(row.symbol);
  const timestamp = formatJournalIso(row.closed_at || row.opened_at);

  const renderAmount = (value: string, withTo = false) => (
    <span className="fm-bot-card-amt">
      <span className="fm-bot-card-num">{withTo ? `to ${value}` : value}</span>
      <span className="fm-bot-card-unit">{unit}</span>
    </span>
  );

  if (!closed) {
    return (
      <article className="fm-bot-card fm-bot-card--pending">
        <div className="fm-bot-card-head">
          <span className="fm-bot-card-badge fm-bot-card-badge--muted">
            <span className="fm-bot-card-badge-inner">
              <img alt="" src={botDetailAssets.feedFlag} />
            </span>
          </span>
          <p className="fm-bot-card-title">{t("bot.cardOpening")}</p>
        </div>
        <div className="fm-bot-card-line fm-bot-card-line--primary">
          <span className="fm-bot-feed-ico-wrap">
            <img alt="" className="fm-bot-feed-ico fm-bot-feed-ico--actual" src={botDetailAssets.feedIcoActual} />
          </span>
          <span className="fm-bot-card-dim">{t("bot.dimActualPrice")}</span>
          {renderAmount(fmtPriceQuote(row.entry_price))}
        </div>
        <p className="fm-bot-card-time">{timestamp}</p>
      </article>
    );
  }

  const profitable = rp != null && rp > 0;
  const lossLike = rp == null || rp <= 0;

  /** Прибыльный long → цена вверх; прибыльный short → цена вниз. */
  const profitPriceUp = !isShort;

  if (profitable) {
    return (
      <article className="fm-bot-card fm-bot-card--profit">
        <div className="fm-bot-card-head">
          <span className="fm-bot-card-badge fm-bot-card-badge--ok">
            <img alt="" className="fm-bot-check" src={botDetailAssets.feedCheck} />
          </span>
          <p className="fm-bot-card-title">{t("bot.predictionOk")}</p>
        </div>
        <div className="fm-bot-card-line fm-bot-card-line--primary">
          <span className="fm-bot-feed-ico-wrap">
            <img
              alt=""
              className={`fm-bot-feed-ico ${profitPriceUp ? "fm-bot-feed-ico--up" : "fm-bot-feed-ico--down"}`}
              src={profitPriceUp ? botDetailAssets.feedIcoUp : botDetailAssets.feedIcoDown}
            />
          </span>
          <span className="fm-bot-card-dim">{profitPriceUp ? t("bot.priceUp") : t("bot.priceDown")}</span>
          {renderAmount(fmtPriceQuote(row.exit_price), true)}
        </div>
        <div className="fm-bot-card-line fm-bot-card-line--secondary">
          <span className="fm-bot-feed-ico-wrap">
            <img alt="" className="fm-bot-feed-ico fm-bot-feed-ico--trend-profit" src={botDetailAssets.feedIcoTrendProfit} />
          </span>
          <span className="fm-bot-card-dim">{t("bot.predictionProfit")}</span>
          <span className="fm-bot-card-num">{fmtPctAbs(rp)}</span>
        </div>
        <p className="fm-bot-card-time">{timestamp}</p>
      </article>
    );
  }

  /* loss или 0% — макет «отрицательная сделка» */
  if (lossLike) {
    /** Убыточный long → цена вниз; убыточный short → цена вверх. */
    const lossPriceUp = isShort;
    return (
      <article className="fm-bot-card fm-bot-card--loss">
        <div className="fm-bot-card-head">
          <span className="fm-bot-card-badge fm-bot-card-badge--bad">
            <img alt="" className="fm-bot-x" src={botDetailAssets.feedBadgeX} />
          </span>
          <p className="fm-bot-card-title">{t("bot.predictionFail")}</p>
        </div>
        <div className="fm-bot-card-line fm-bot-card-line--primary">
          <span className="fm-bot-feed-ico-wrap">
            <img
              alt=""
              className={`fm-bot-feed-ico ${lossPriceUp ? "fm-bot-feed-ico--up" : "fm-bot-feed-ico--down"}`}
              src={lossPriceUp ? botDetailAssets.feedIcoUp : botDetailAssets.feedIcoDown}
            />
          </span>
          <span className="fm-bot-card-dim">{lossPriceUp ? t("bot.priceUp") : t("bot.priceDown")}</span>
          {renderAmount(fmtPriceQuote(row.exit_price), true)}
        </div>
        <div className="fm-bot-card-line fm-bot-card-line--secondary">
          <span className="fm-bot-feed-ico-wrap">
            <img alt="" className="fm-bot-feed-ico fm-bot-feed-ico--trend-loss" src={botDetailAssets.feedIcoTrendLoss} />
          </span>
          <span className="fm-bot-card-dim">{t("bot.predictionLoss")}</span>
          <span className="fm-bot-card-num">{fmtPctAbs(rp)}</span>
        </div>
        <p className="fm-bot-card-time">{timestamp}</p>
      </article>
    );
  }

  return null;
}

