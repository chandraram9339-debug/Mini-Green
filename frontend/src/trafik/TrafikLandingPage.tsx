import { useEffect, useMemo, useRef, useState } from "react";

import { getTrafikAppUrl } from "./getTrafikAppUrl";
import mock from "./trafikLandingMock.json";
import "./TrafikLandingPage.css";

type ChartPoint = { t: string; v: number };

const OVERLAY_MESSAGES = [
  "Connecting to secure interface...",
  "Initializing AI execution layer...",
  "Opening dashboard...",
] as const;

function TrafikHeroChart({ series, gradientId = "tl-chart-fill" }: { series: ChartPoint[]; gradientId?: string }) {
  const geometry = useMemo(() => {
    if (series.length < 2) return null;
    const w = 360;
    const h = 112;
    const padX = 12;
    const padY = 10;
    const bottom = h - padY;
    const vals = series.map((s) => s.v);
    const minV = Math.min(0, ...vals);
    const maxV = Math.max(0.01, ...vals);
    const span = Math.max(maxV - minV, 0.0001);
    const coords = series.map((s, i) => {
      const x = padX + (i / (series.length - 1)) * (w - padX * 2);
      const ny = (s.v - minV) / span;
      const y = padY + (1 - ny) * (h - padY * 2);
      return [x, y] as const;
    });
    const lineD = coords
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(" ");
    const first = coords[0]!;
    const last = coords[coords.length - 1]!;
    const areaD = `${lineD} L ${last[0].toFixed(1)} ${bottom} L ${first[0].toFixed(1)} ${bottom} Z`;
    return { lineD, areaD };
  }, [series]);

  return (
    <svg className="tl-chart-svg" viewBox="0 0 360 112" role="img" aria-label="Demo performance curve">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(45, 110, 147, 0.45)" />
          <stop offset="100%" stopColor="rgba(45, 110, 147, 0)" />
        </linearGradient>
      </defs>
      <rect width="360" height="112" className="tl-chart-bg" rx="10" />
      {geometry ? (
        <>
          <path className="tl-chart-area" d={geometry.areaD} fill={`url(#${gradientId})`} />
          <path className="tl-chart-line" d={geometry.lineD} fill="none" />
        </>
      ) : null}
    </svg>
  );
}

export default function TrafikLandingPage() {
  const data = mock;
  const chartSeries = data.chart_series_pct as ChartPoint[];
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Palladium · Trading interface";
    return () => {
      document.title = prev;
    };
  }, []);
  const [overlayIdx, setOverlayIdx] = useState(0);
  const timersRef = useRef<{ interval: number | null; timeout: number | null }>({
    interval: null,
    timeout: null,
  });

  useEffect(() => {
    return () => {
      if (timersRef.current.interval) window.clearInterval(timersRef.current.interval);
      if (timersRef.current.timeout) window.clearTimeout(timersRef.current.timeout);
    };
  }, []);

  const handleCta = () => {
    if (overlayOpen) return;
    setOverlayOpen(true);
    setOverlayIdx(0);
    const delayMs = 1200 + Math.floor(Math.random() * 601);
    const steps = OVERLAY_MESSAGES.length;
    const stepMs = Math.max(380, Math.floor(delayMs / steps));

    timersRef.current.interval = window.setInterval(() => {
      setOverlayIdx((i) => Math.min(i + 1, steps - 1));
    }, stepMs);

    timersRef.current.timeout = window.setTimeout(() => {
      if (timersRef.current.interval) window.clearInterval(timersRef.current.interval);
      timersRef.current.interval = null;
      timersRef.current.timeout = null;
      window.location.assign(getTrafikAppUrl());
    }, delayMs);
  };

  return (
    <div className="tl-root">
      {overlayOpen ? (
        <div className="tl-overlay" role="alertdialog" aria-live="polite" aria-busy="true">
          <div className="tl-overlay-panel">
            <div className="tl-overlay-spinner" aria-hidden="true" />
            <p className="tl-overlay-text">{OVERLAY_MESSAGES[overlayIdx]}</p>
          </div>
        </div>
      ) : null}

      <header className="tl-topbar">
        <div className="tl-wrap tl-topbar-inner">
          <img className="tl-logo" src="/trafik/assets/logo-palladium.png" alt="" width={132} height={36} />
          <span className="tl-brand-wordmark">Palladium</span>
        </div>
      </header>

      <main>
        <section className="tl-hero">
          <div className="tl-wrap tl-hero-grid">
            <div className="tl-hero-copy">
              <p className="tl-kicker">Autonomous trading application</p>
              <h1 className="tl-h1">AI-powered market execution on your phone</h1>
              <p className="tl-lead">
                A smart dashboard for portfolio automation and real-time market interface — structured analytics,
                controlled workflows, no hype.
              </p>
              <div className="tl-cta-row">
                <button type="button" className="tl-btn tl-btn--primary" onClick={handleCta}>
                  Launch App
                </button>
                <button type="button" className="tl-btn tl-btn--ghost" onClick={handleCta}>
                  Open Dashboard
                </button>
                <button type="button" className="tl-btn tl-btn--ghost" onClick={handleCta}>
                  Start Using Interface
                </button>
              </div>
              <p className="tl-microcopy">{data._meta.disclaimer}</p>
            </div>
            <div className="tl-hero-visual">
              <div className="tl-phone">
                <div className="tl-phone-notch" aria-hidden="true" />
                <div className="tl-phone-screen-stack">
                  <img
                    className="tl-phone-screen"
                    src="/trafik/screens/home.png"
                    alt="Application preview"
                    width={390}
                    height={844}
                  />
                  <div className="tl-phone-chart-overlay" aria-hidden="true">
                    <TrafikHeroChart series={chartSeries} gradientId="tl-chart-fill-phone" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="tl-section tl-section--muted">
          <div className="tl-wrap">
            <h2 className="tl-h2">Live dashboard snapshot</h2>
            <p className="tl-sub">Illustrative simulation — not live client data.</p>
            <div className="tl-stat-grid">
              <article className="tl-card tl-card--balance">
                <p className="tl-card-label">Total balance ({data._meta.currency})</p>
                <p className="tl-card-value">{data.portfolio.total_balance}</p>
                <p className="tl-card-hint">{data.portfolio.daily_change_label}</p>
              </article>
              <article className="tl-card">
                <p className="tl-card-label">Interface status</p>
                <p className="tl-card-value">{data.automation.interface_status}</p>
                <p className="tl-card-hint">{data.automation.active_strategies_note}</p>
              </article>
              <article className="tl-card">
                <p className="tl-card-label">Executed trades ({data.execution_summary.period_label})</p>
                <p className="tl-card-value">{data.execution_summary.executed_trades}</p>
                <p className="tl-card-hint">{data.execution_summary.percentage_note}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="tl-section">
          <div className="tl-wrap tl-split">
            <div>
              <h2 className="tl-h2">Market curve (demo)</h2>
              <p className="tl-sub">Visualizes session-relative movement for layout review only.</p>
              <TrafikHeroChart series={chartSeries} />
              <ul className="tl-mini-metrics">
                <li>
                  <span className="tl-muted">Benchmark</span> {data.market_status.benchmark_pair}
                </li>
                <li>
                  <span className="tl-muted">Reference</span> {data.market_status.reference_price_display}
                </li>
              </ul>
            </div>
            <div className="tl-mock-col">
              <img className="tl-mock-img" src="/trafik/screens/dashboard.png" alt="" />
            </div>
          </div>
        </section>

        <section className="tl-section tl-section--muted">
          <div className="tl-wrap">
            <h2 className="tl-h2">Execution log preview</h2>
            <p className="tl-sub">{data.ai_status.headline}</p>
            <div className="tl-log-grid">
              {data.execution_logs_demo.map((row, i) => (
                <article key={i} className="tl-log-card">
                  <div className="tl-log-head">
                    <span className="tl-log-pair">{row.pair}</span>
                    <span className={`tl-log-badge ${row.side === "Long" ? "tl-log-badge--long" : "tl-log-badge--short"}`}>
                      {row.side}
                    </span>
                  </div>
                  <p className="tl-log-meta">{row.timestamp}</p>
                  <p className="tl-log-result">
                    {row.result_label} · <span className="tl-log-pnl">{row.pnl_display}</span>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="tl-section">
          <div className="tl-wrap">
            <h2 className="tl-h2 tl-center">What we leave out</h2>
            <div className="tl-pill-grid">
              <article className="tl-pill-card">
                <h3 className="tl-h3">No signals</h3>
                <p className="tl-p">No third-party “calls” — focus stays on your dashboard and logs.</p>
              </article>
              <article className="tl-pill-card">
                <h3 className="tl-h3">No gurus</h3>
                <p className="tl-p">No personalities — automation and analytics only.</p>
              </article>
              <article className="tl-pill-card">
                <h3 className="tl-h3">No manual trading noise</h3>
                <p className="tl-p">Designed as a calm execution interface — not a chaotic tape.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="tl-section tl-section--muted">
          <div className="tl-wrap">
            <h2 className="tl-h2">{data.demo_performance_panel.title}</h2>
            <div className="tl-demo-grid">
              <div>
                <p className="tl-muted">Volatility (illustrative)</p>
                <p className="tl-demo-val">{data.demo_performance_panel.volatility_display}</p>
              </div>
              <div>
                <p className="tl-muted">Demo drawdown curve</p>
                <p className="tl-demo-val">{data.demo_performance_panel.max_drawdown_style_display}</p>
              </div>
              <div>
                <p className="tl-muted">Automation latency</p>
                <p className="tl-demo-val">{data.ai_status.latency_display_ms} ms</p>
              </div>
            </div>
            <p className="tl-footnote">{data.demo_performance_panel.footnote}</p>
          </div>
        </section>

        <section className="tl-footer-cta">
          <div className="tl-wrap tl-footer-inner">
            <h2 className="tl-h2 tl-center">Ready for the interface?</h2>
            <div className="tl-cta-row tl-cta-row--center">
              <button type="button" className="tl-btn tl-btn--primary" onClick={handleCta}>
                Launch App
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="tl-footer">
        <div className="tl-wrap tl-footer-meta">
          <p>© {new Date().getFullYear()} Palladium · autonomous trading application</p>
        </div>
      </footer>
    </div>
  );
}
