import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api";
import type { IntegrationsReport } from "../types";

function yn(v: boolean): string {
  return v ? "да" : "нет";
}

function statusClass(ok: boolean): string {
  return ok ? "ok" : "danger-text";
}

export default function Integrations() {
  const [payload, setPayload] = useState<IntegrationsReport | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  const load = useCallback(() => {
    setErr("");
    setLoading(true);
    apiJson<IntegrationsReport>("/admin/integrations/verify")
      .then((r) => setPayload(r))
      .catch((e: Error) => {
        setPayload(null);
        setErr(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const r = payload;

  return (
    <>
      <div className="topbar">
        <h2 style={{ margin: 0 }}>Проверка интеграций</h2>
        <button type="button" className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? "Проверка…" : "Обновить"}
        </button>
      </div>
      <p className="muted">
        GET /admin/integrations/verify — без секретов: Telegram (getMe), TronGrid (блок), режимы кошельков, торговый мост,
        список подсказок.
      </p>
      {err ? <div className="err">{err}</div> : null}

      {loading && !r ? (
        <div className="card muted">Загрузка…</div>
      ) : null}

      {r ? (
        <>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="label">Telegram</div>
              <div className={`value ${statusClass(r.telegram.ok)}`}>
                {r.telegram.ok ? "OK" : "Проблема"}
              </div>
              <div className="muted" style={{ marginTop: "0.35rem", fontSize: 12 }}>
                {r.telegram.bot_username ? `@${r.telegram.bot_username}` : "—"}
                {r.telegram.http_status != null ? ` · HTTP ${r.telegram.http_status}` : ""}
              </div>
            </div>
            <div className="stat-box">
              <div className="label">Tron RPC</div>
              <div className={`value ${statusClass(r.tron.ok)}`}>{r.tron.ok ? "OK" : "Проблема"}</div>
              <div className="muted" style={{ marginTop: "0.35rem", fontSize: 12 }}>
                {r.tron.has_api_key ? "ключ API задан" : "без TRON_API_KEY"}
              </div>
            </div>
            <div className="stat-box">
              <div className="label">Режим</div>
              <div className="value" style={{ fontSize: "1rem" }}>
                auth: {r.mode.auth_provider}
              </div>
              <div className="muted" style={{ marginTop: "0.35rem", fontSize: 12 }}>
                LIVE_TRON {yn(r.mode.live_tron)} · SEND {yn(r.mode.live_tron_send)}
              </div>
            </div>
            <div className="stat-box">
              <div className="label">Meta CAPI</div>
              <div className={`value ${statusClass(r.meta.purchase_ready)}`}>
                {r.meta.purchase_ready ? "Готов" : "Не настроен"}
              </div>
              <div className="muted" style={{ marginTop: "0.35rem", fontSize: 12 }}>
                пикселей: {r.meta.pixels.length} · test code {yn(r.meta.test_event_code_configured)}
              </div>
            </div>
          </div>

          {r.telegram.error ? (
            <div className="card">
              <strong>Telegram:</strong> <span className="danger-text">{r.telegram.error}</span>
            </div>
          ) : null}
          {r.tron.error ? (
            <div className="card">
              <strong>Tron:</strong> <span className="danger-text">{r.tron.error}</span>
              {r.tron.full_host ? (
                <div className="muted" style={{ marginTop: "0.35rem" }}>
                  Host: <code>{r.tron.full_host}</code>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="card">
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Подсказки</h3>
            {r.hints.length === 0 ? (
              <p className="ok" style={{ margin: 0 }}>
                Нет предупреждений по текущей конфигурации.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {r.hints.map((h, i) => (
                  <li key={i} style={{ marginBottom: "0.35rem" }}>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Кошельки и ончейн</h3>
            <table className="data">
              <tbody>
                <tr>
                  <td>WALLET_SEED_PER_USER</td>
                  <td>{yn(r.wallets.wallet_seed_per_user)}</td>
                </tr>
                <tr>
                  <td>WALLET_STORE_ENCRYPTED_PK</td>
                  <td>{yn(r.wallets.wallet_store_encrypted_pk)}</td>
                </tr>
                <tr>
                  <td>USER_WALLET_ENCRYPTION_KEY (64 hex)</td>
                  <td>{yn(r.wallets.user_wallet_encryption_key_configured)}</td>
                </tr>
                <tr>
                  <td>TRON_DEPOSIT_WALLET_CREATE_URL задан</td>
                  <td>{yn(r.wallets.tron_deposit_wallet_create_url_configured)}</td>
                </tr>
                <tr>
                  <td>HD mnemonic / deterministic key</td>
                  <td>
                    {yn(r.wallets.hd_wallet_mnemonic_configured)} / {yn(r.wallets.deterministic_derive_key_configured)}
                  </td>
                </tr>
                <tr>
                  <td>LIVE_TRON / LIVE_TRON_SEND</td>
                  <td>
                    {yn(r.wallets.live_tron)} / {yn(r.wallets.live_tron_send)}
                  </td>
                </tr>
                <tr>
                  <td>GAZ_BANK / WITHDRAW ключи (формат)</td>
                  <td>
                    {yn(r.wallets.gaz_bank_private_key_configured)} / {yn(r.wallets.withdraw_wallet_private_key_configured)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Торговый мост</h3>
            <table className="data">
              <tbody>
                <tr>
                  <td>TRADING_ENGINE_NOTIFY_URL</td>
                  <td>{yn(r.trading.engine_notify_url_configured)}</td>
                </tr>
                <tr>
                  <td>TRADING_INGEST_SECRET</td>
                  <td>{yn(r.trading.ingest_secret_configured)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Meta CAPI</h3>
            <table className="data">
              <tbody>
                <tr>
                  <td>Пиксели включены</td>
                  <td>{r.meta.pixels.length}</td>
                </tr>
                <tr>
                  <td>Env fallback META_* задан</td>
                  <td>{yn(r.meta.env_fallback_configured)}</td>
                </tr>
                <tr>
                  <td>META_TEST_EVENT_CODE</td>
                  <td>{yn(r.meta.test_event_code_configured)}</td>
                </tr>
                <tr>
                  <td>TELEGRAM_WEBHOOK_SECRET</td>
                  <td>{yn(r.meta.webhook_secret_configured)}</td>
                </tr>
                <tr>
                  <td>Subscribe / Purchase ready</td>
                  <td>
                    {yn(r.meta.subscribe_ready)} / {yn(r.meta.purchase_ready)}
                  </td>
                </tr>
                <tr>
                  <td>Purchase threshold</td>
                  <td>{r.meta.purchase_threshold_usdt} USDT</td>
                </tr>
              </tbody>
            </table>
            {r.meta.notes.length > 0 ? (
              <ul style={{ margin: "0.75rem 0 0", paddingLeft: "1.25rem" }}>
                {r.meta.notes.map((note, i) => (
                  <li key={i} style={{ marginBottom: "0.35rem" }}>
                    {note}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="card">
            <button type="button" className="btn" onClick={() => setShowRaw((s) => !s)} style={{ marginBottom: "0.75rem" }}>
              {showRaw ? "Скрыть JSON" : "Показать полный JSON"}
            </button>
            {showRaw ? (
              <pre style={{ fontSize: 12, overflow: "auto", maxHeight: "55vh", margin: 0 }}>
                {JSON.stringify(r, null, 2)}
              </pre>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
