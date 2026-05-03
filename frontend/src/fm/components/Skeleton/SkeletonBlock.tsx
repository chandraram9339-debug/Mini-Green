import s from "./SkeletonBlock.module.css";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export type SkeletonChartVariant = "trading" | "home";

/**
 * Chart-area skeleton matching AutoScaledProfitChart / Home chart shells (~122px plot height).
 * For Trading (`plotAreaOnly`), only the plot column shimmers so real Y-axis % labels stay visible.
 */
export function SkeletonChart({
  variant = "trading",
  plotAreaOnly = false,
  className,
}: {
  variant?: SkeletonChartVariant;
  plotAreaOnly?: boolean;
  className?: string;
}) {
  if (plotAreaOnly && variant === "trading") {
    return (
      <div className={cx(s.chartPlotOnlyRoot, className)} aria-hidden>
        <div className={cx(s.shimmer, s.chartPlot)} />
      </div>
    );
  }

  const grid = variant === "home" ? s.homeChartGrid : s.chartGrid;
  const axis = variant === "home" ? s.homeChartAxis : s.chartAxis;
  const plot = variant === "home" ? s.homeChartPlot : s.chartPlot;

  return (
    <div className={cx(grid, className)} aria-hidden>
      <div className={cx(s.shimmer, axis)} />
      <div className={cx(s.shimmer, plot)} />
    </div>
  );
}

/**
 * Bot journal feed — row height aligned with TradeCard (see TradeCard.module.css .card).
 */
export function SkeletonFeedRows({
  count = 5,
  showMetaLine = false,
  className,
}: {
  count?: number;
  showMetaLine?: boolean;
  className?: string;
}) {
  return (
    <div className={cx(s.lines, className)} aria-hidden>
      {showMetaLine ? <div className={cx(s.shimmer, s.metaLine)} /> : null}
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cx(s.shimmer, s.feedRow)} />
      ))}
    </div>
  );
}

/**
 * Wallet history list rows (~95px min-height per list item in BalanceDepositScreenNew).
 */
export function SkeletonWalletHistoryRows({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cx(s.linesWallet, className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cx(s.shimmer, s.walletHistoryRow)} />
      ))}
    </div>
  );
}
