import type { TradingJournalItem } from "../../api/fetchTradingJournal";
import type { MessageKey } from "../../i18n/messages";
import {
  IconOpeningGlyph,
  IconPredictionFailGlyph,
  IconPredictionOkGlyph,
  IconPriceDown24,
  IconPriceUp24,
  IconTrendLine24,
} from "./tradeHistoryIcons";
import {
  fmtPctAbs,
  fmtPriceQuote,
  formatJournalIso,
  formatUnitLabel,
} from "./tradeCardFormat";
import styles from "./TradeCard.module.css";

type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function TradeCard({ row, t }: { row: TradingJournalItem; t: TFn }) {
  const isShort = String(row.side).toLowerCase() === "short";
  const closed = row.status === "closed";
  const rp = row.result_percent;
  const unit = formatUnitLabel(row.symbol);
  const timestamp = formatJournalIso(row.closed_at || row.opened_at);

  const renderAmount = (value: string, withTo = false) => (
    <span className={styles.amt}>
      <span className={styles.num}>{withTo ? `to ${value}` : value}</span>
      <span className={styles.unit}>{unit}</span>
    </span>
  );

  if (!closed) {
    return (
      <article className={`${styles.card} ${styles.cardPending}`}>
        <div className={styles.head}>
          <span className={styles.badge}>
            <span className={styles.badgeInner}>
              <IconOpeningGlyph />
            </span>
          </span>
          <p className={styles.title}>{t("bot.cardOpening")}</p>
        </div>
        <div className={styles.row}>
          <span className={styles.icoSpacer} aria-hidden />
          <div className={styles.rowText}>
            <span className={styles.label}>{t("bot.dimActualPrice")}</span>
            {renderAmount(fmtPriceQuote(row.entry_price))}
          </div>
        </div>
        <p className={`${styles.time} ${styles.timeCorner}`}>{timestamp}</p>
      </article>
    );
  }

  const profitable = rp != null && rp > 0;
  const lossLike = rp == null || rp <= 0;
  const profitPriceUp = !isShort;

  if (profitable) {
    return (
      <article className={`${styles.card} ${styles.cardProfit}`}>
        <div className={styles.head}>
          <span className={styles.badgeOk}>
            <IconPredictionOkGlyph />
          </span>
          <p className={styles.title}>{t("bot.predictionOk")}</p>
        </div>
        <div className={styles.row}>
          <span className={styles.icoWrap}>
            {profitPriceUp ? <IconPriceUp24 /> : <IconPriceDown24 />}
          </span>
          <div className={styles.rowText}>
            <span className={styles.label}>{profitPriceUp ? t("bot.priceUp") : t("bot.priceDown")}</span>
            {renderAmount(fmtPriceQuote(row.exit_price), true)}
          </div>
        </div>
        <div className={`${styles.row} ${styles.rowSecondary} ${styles.rowStat}`}>
          <span className={styles.icoWrap}>
            <IconTrendLine24 />
          </span>
          <div className={styles.rowText}>
            <span className={styles.label}>{t("bot.predictionProfit")}</span>
            <span className={`${styles.num} ${styles.numProfit}`}>{fmtPctAbs(rp)}</span>
          </div>
          <p className={`${styles.time} ${styles.timeInline}`}>{timestamp}</p>
        </div>
      </article>
    );
  }

  if (lossLike) {
    const lossPriceUp = isShort;
    return (
      <article className={`${styles.card} ${styles.cardLoss}`}>
        <div className={styles.head}>
          <span className={styles.badgeBad}>
            <IconPredictionFailGlyph />
          </span>
          <p className={styles.title}>{t("bot.predictionFail")}</p>
        </div>
        <div className={styles.row}>
          <span className={styles.icoWrap}>
            {lossPriceUp ? <IconPriceUp24 /> : <IconPriceDown24 />}
          </span>
          <div className={styles.rowText}>
            <span className={styles.label}>{lossPriceUp ? t("bot.priceUp") : t("bot.priceDown")}</span>
            {renderAmount(fmtPriceQuote(row.exit_price), true)}
          </div>
        </div>
        <div className={`${styles.row} ${styles.rowSecondary} ${styles.rowStat}`}>
          <span className={styles.icoWrap}>
            <IconTrendLine24 />
          </span>
          <div className={styles.rowText}>
            <span className={styles.label}>{t("bot.predictionLoss")}</span>
            <span className={`${styles.num} ${styles.numLoss}`}>{fmtPctAbs(rp)}</span>
          </div>
          <p className={`${styles.time} ${styles.timeInline}`}>{timestamp}</p>
        </div>
      </article>
    );
  }

  return null;
}
