import { FormEvent, useEffect, useState } from "react";
import { api, apiJson } from "../api";
import type { MetaAccountRow, MetaDispatchSummary, MetaStatusResponse } from "../types";

export default function MetaAccounts() {
  const [items, setItems] = useState<MetaAccountRow[]>([]);
  const [status, setStatus] = useState<MetaStatusResponse | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [label, setLabel] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [token, setToken] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [testTg, setTestTg] = useState("10001");
  const [testPurchaseNet, setTestPurchaseNet] = useState("10");
  const [lastTest, setLastTest] = useState<MetaDispatchSummary | null>(null);

  function load() {
    setErr("");
    void Promise.all([
      apiJson<{ items: MetaAccountRow[] }>("/admin/meta-accounts"),
      apiJson<MetaStatusResponse>("/admin/meta/status")
    ])
      .then(([accounts, metaStatus]) => {
        setItems(accounts.items);
        setStatus(metaStatus);
      })
      .catch((e: Error) => setErr(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await apiJson("/admin/meta-accounts", {
        method: "POST",
        body: JSON.stringify({
          label: label || null,
          pixel_id: pixelId.trim(),
          access_token: token.trim(),
          is_enabled: enabled ? 1 : 0
        })
      });
      setLabel("");
      setPixelId("");
      setToken("");
      setMsg("Meta-аккаунт добавлен");
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить аккаунт Meta?")) return;
    setBusy(id);
    setErr("");
    setMsg("");
    try {
      const r = await api(`/admin/meta-accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      setMsg("Meta-аккаунт удалён");
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function runSubscribeTest() {
    const tg = testTg.trim();
    if (!tg) {
      setErr("Укажите tg_user_id для тестового Subscribe");
      return;
    }
    setBusy("test-subscribe");
    setErr("");
    setMsg("");
    try {
      const r = await apiJson<{ ok: boolean; summary: MetaDispatchSummary }>("/admin/meta/test/subscribe", {
        method: "POST",
        body: JSON.stringify({ tg_user_id: tg })
      });
      setLastTest(r.summary);
      setMsg("Тестовый Subscribe выполнен");
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function runPurchaseTest() {
    const tg = testTg.trim();
    const net = Number(testPurchaseNet);
    if (!tg || !Number.isFinite(net) || net <= 0) {
      setErr("Укажите tg_user_id и положительный net_usdt для тестового Purchase");
      return;
    }
    setBusy("test-purchase");
    setErr("");
    setMsg("");
    try {
      const r = await apiJson<{ ok: boolean; summary: MetaDispatchSummary }>("/admin/meta/test/purchase", {
        method: "POST",
        body: JSON.stringify({ tg_user_id: tg, net_usdt: net })
      });
      setLastTest(r.summary);
      setMsg("Тестовый Purchase выполнен");
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <h2>Пиксель Meta и CAPI</h2>
      <p className="muted">
        Токен хранится на сервере; здесь можно настроить пиксели, увидеть текущий статус CAPI и прогнать безопасные
        тестовые события без изменения кошельков.
      </p>
      {err ? <div className="err">{err}</div> : null}
      {msg ? <div className="ok">{msg}</div> : null}

      {status ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Текущий статус</h3>
          <table className="data">
            <tbody>
              <tr>
                <td>Включённых Meta-аккаунтов</td>
                <td>{status.enabled_meta_accounts_count}</td>
              </tr>
              <tr>
                <td>Env fallback META_*</td>
                <td>{status.env_fallback_configured ? "да" : "нет"}</td>
              </tr>
              <tr>
                <td>META_TEST_EVENT_CODE</td>
                <td>{status.test_event_code_configured ? "да" : "нет"}</td>
              </tr>
              <tr>
                <td>TELEGRAM_WEBHOOK_SECRET</td>
                <td>{status.webhook_secret_configured ? "да" : "нет"}</td>
              </tr>
              <tr>
                <td>Subscribe ready</td>
                <td>{status.subscribe_ready ? "да" : "нет"}</td>
              </tr>
              <tr>
                <td>Purchase ready</td>
                <td>{status.purchase_ready ? "да" : "нет"}</td>
              </tr>
              <tr>
                <td>Purchase threshold</td>
                <td>{status.purchase_threshold_usdt} USDT</td>
              </tr>
            </tbody>
          </table>
          {status.pixels.length > 0 ? (
            <div style={{ marginTop: "0.75rem" }}>
              <strong>Активные пиксели</strong>
              <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem" }}>
                {status.pixels.map((p) => (
                  <li key={`${p.pixel_id}-${p.source}`}>
                    {p.pixel_id} {p.label ? `(${p.label})` : ""} · {p.source}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {status.notes.length > 0 ? (
            <ul style={{ margin: "0.75rem 0 0", paddingLeft: "1.25rem" }}>
              {status.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Тестовый прогон CAPI</h3>
        <div className="row">
          <label htmlFor="meta-test-tg">tg_user_id</label>
          <input id="meta-test-tg" value={testTg} onChange={(e) => setTestTg(e.target.value)} />
        </div>
        <div className="row">
          <label htmlFor="meta-test-purchase">net_usdt для Purchase</label>
          <input
            id="meta-test-purchase"
            type="number"
            step="any"
            value={testPurchaseNet}
            onChange={(e) => setTestPurchaseNet(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy === "test-subscribe"}
            onClick={() => void runSubscribeTest()}
          >
            {busy === "test-subscribe" ? "Проверка Subscribe…" : "Test Subscribe"}
          </button>
          <button
            type="button"
            className="btn"
            disabled={busy === "test-purchase"}
            onClick={() => void runPurchaseTest()}
          >
            {busy === "test-purchase" ? "Проверка Purchase…" : "Test Purchase"}
          </button>
          <button type="button" className="btn" onClick={load}>
            Обновить статус
          </button>
        </div>
      </div>

      {lastTest ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Последний тест</h3>
          <table className="data">
            <tbody>
              <tr>
                <td>Событие</td>
                <td>{lastTest.event_name}</td>
              </tr>
              <tr>
                <td>event_id</td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{lastTest.event_id}</td>
              </tr>
              <tr>
                <td>external_id</td>
                <td>{lastTest.external_id}</td>
              </tr>
              <tr>
                <td>eligible / skipped</td>
                <td>
                  {lastTest.eligible ? "eligible" : "skipped"}
                  {lastTest.skipped_reason ? ` · ${lastTest.skipped_reason}` : ""}
                </td>
              </tr>
              <tr>
                <td>sent / failed</td>
                <td>
                  {lastTest.sent_pixels} / {lastTest.failed_pixels}
                </td>
              </tr>
              <tr>
                <td>META_TEST_EVENT_CODE</td>
                <td>{lastTest.test_event_code_configured ? "да" : "нет"}</td>
              </tr>
            </tbody>
          </table>
          {lastTest.results.length > 0 ? (
            <table className="data" style={{ marginTop: "0.75rem" }}>
              <thead>
                <tr>
                  <th>pixel_id</th>
                  <th>source</th>
                  <th>status</th>
                  <th>http</th>
                  <th>response</th>
                </tr>
              </thead>
              <tbody>
                {lastTest.results.map((r) => (
                  <tr key={`${r.pixel_id}-${r.source}-${r.status}`}>
                    <td>{r.pixel_id}</td>
                    <td>{r.source}</td>
                    <td>{r.status}</td>
                    <td>{r.http_status ?? "—"}</td>
                    <td style={{ maxWidth: 420, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {r.response_preview ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      ) : null}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Как перейти к реальному E2E</h3>
        <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
          <li>Добавьте рабочий pixel/access token или задайте `META_*` в окружении backend.</li>
          <li>Задайте `META_TEST_EVENT_CODE`, чтобы смотреть события в Test Events.</li>
          <li>Для Subscribe настройте `TELEGRAM_WEBHOOK_SECRET` и реальный webhook Telegram.</li>
          <li>Для Purchase используйте обычный/manual deposit с net выше текущего порога Meta.</li>
        </ol>
      </div>

      <div className="meta-two-col">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Новый аккаунт</h3>
          <form onSubmit={add}>
            <div className="row">
              <label htmlFor="lbl">Подпись</label>
              <input id="lbl" value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className="row">
              <label htmlFor="pid">pixel_id</label>
              <input id="pid" value={pixelId} onChange={(e) => setPixelId(e.target.value)} required />
            </div>
            <div className="row">
              <label htmlFor="tok">access_token</label>
              <input id="tok" type="password" value={token} onChange={(e) => setToken(e.target.value)} required />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              Включён
            </label>
            <button type="submit" className="btn btn-primary">
              Добавить
            </button>
          </form>
        </div>

        <div className="card" style={{ overflowX: "auto" }}>
          <table className="data">
            <thead>
              <tr>
                <th>ID</th>
                <th>Подпись</th>
                <th>pixel_id</th>
                <th>Вкл.</th>
                <th>Создан</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{m.id}</td>
                  <td>{m.label ?? "—"}</td>
                  <td>{m.pixel_id}</td>
                  <td>{m.is_enabled ? "да" : "нет"}</td>
                  <td>{m.created_at}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={busy === m.id}
                      onClick={() => void remove(m.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
