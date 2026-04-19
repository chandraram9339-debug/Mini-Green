import { FormEvent, useState } from "react";
import { api, apiJson } from "../api";
import { fmtIso, usdFromMinor, usdToMinor } from "../util";

type ExtendedStats = {
  tg_user_id: string;
  balance_usdt_minor: number;
  sum_deposits_gross_minor: number;
  sum_withdrawals_minor: number;
  referral_received_minor: number;
  invited_users_count: number;
};

type TradePositionAdminRow = {
  id: string;
  user_id: number;
  symbol: string;
  side: string;
  size_minor: number;
  opened_at: string;
  created_at: string;
  closed_at: string | null;
};

export default function User() {
  const [tg, setTg] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [depN, setDepN] = useState<number | null>(null);
  const [wdN, setWdN] = useState<number | null>(null);
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const [ext, setExt] = useState<ExtendedStats | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [depAmt, setDepAmt] = useState("");
  const [wdAmt, setWdAmt] = useState("");
  const [wdAddr, setWdAddr] = useState("");
  const [childTgs, setChildTgs] = useState("");
  const [refReferrer, setRefReferrer] = useState("");
  const [refAmt, setRefAmt] = useState("");
  const [wipeConfirm, setWipeConfirm] = useState("");
  const [attachForce, setAttachForce] = useState(false);

  const [tradePositions, setTradePositions] = useState<TradePositionAdminRow[]>([]);
  const [tpSymbol, setTpSymbol] = useState("");
  const [tpSide, setTpSide] = useState<"long" | "short">("long");
  const [tpSizeUsd, setTpSizeUsd] = useState("");
  const [tpOpenedAt, setTpOpenedAt] = useState("");

  async function loadTradePositions() {
    const id = tg.trim();
    if (!id) return;
    try {
      const r = await apiJson<{ items: TradePositionAdminRow[] }>(
        `/admin/users/${encodeURIComponent(id)}/trade-positions`
      );
      setTradePositions(r.items ?? []);
    } catch {
      setTradePositions([]);
    }
  }

  async function loadSummary(e?: FormEvent) {
    e?.preventDefault();
    setErr("");
    setMsg("");
    setData(null);
    setDepN(null);
    setWdN(null);
    setBlocked(null);
    setExt(null);
    setTradePositions([]);
    const id = tg.trim();
    if (!id) return;
    try {
      const r = await apiJson<{ user: Record<string, unknown>; deposits_count: number; withdrawals_count: number }>(
        `/admin/users/${encodeURIComponent(id)}/summary`
      );
      setData(r.user);
      setDepN(r.deposits_count);
      setWdN(r.withdrawals_count);
      setBlocked(r.user.blocked_bot_at != null);
      const st = await apiJson<ExtendedStats>(`/admin/users/${encodeURIComponent(id)}/stats-detail`);
      setExt(st);
      await loadTradePositions();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setTradePositions([]);
    }
  }

  async function resetRecoveryCode() {
    const id = tg.trim();
    if (!id) return;
    if (
      !window.confirm(
        "Сбросить код восстановления учётки? Пользователь увидит новый код при следующем открытии экрана Seed в мини-аппе."
      )
    ) {
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await api(`/admin/users/${encodeURIComponent(id)}/reset-recovery-code`, { method: "POST" });
      const t = await r.text();
      if (!r.ok) throw new Error(t || r.statusText);
      setMsg("Код восстановления сброшен. Попросите пользователя снова открыть Seed.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function postTradePositionClose(positionId: string) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await api(`/admin/trade-positions/${encodeURIComponent(positionId)}/close`, { method: "POST" });
      const t = await r.text();
      if (!r.ok) throw new Error(t || r.statusText);
      setMsg("Позиция закрыта (остаётся в истории)");
      await loadTradePositions();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteTradePositionHard(positionId: string) {
    if (!window.confirm("Удалить строку из БД без истории?")) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await api(`/admin/trade-positions/${encodeURIComponent(positionId)}`, { method: "DELETE" });
      const t = await r.text();
      if (!r.ok) throw new Error(t || r.statusText);
      setMsg("Запись удалена");
      await loadTradePositions();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function addTradePosition(e?: FormEvent) {
    e?.preventDefault();
    const id = tg.trim();
    if (!id) return;
    const sym = tpSymbol.trim().toUpperCase();
    const minor = usdToMinor(Number(tpSizeUsd));
    if (!sym || !Number.isFinite(minor) || minor <= 0) {
      setErr("Укажите символ и положительный размер USDT");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const body: Record<string, unknown> = {
        symbol: sym,
        side: tpSide,
        size_minor: minor
      };
      if (tpOpenedAt.trim()) body.opened_at = tpOpenedAt.trim();
      const r = await api(`/admin/users/${encodeURIComponent(id)}/trade-positions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const t = await r.text();
      if (!r.ok) throw new Error(t || r.statusText);
      setMsg("Позиция добавлена");
      setTpSymbol("");
      setTpSizeUsd("");
      setTpOpenedAt("");
      await loadTradePositions();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function setBotBlock(block: boolean) {
    const id = tg.trim();
    if (!id) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await api(`/admin/users/${encodeURIComponent(id)}/bot-blocked`, {
        method: "POST",
        body: JSON.stringify({ block })
      });
      if (!r.ok) throw new Error(await r.text());
      await loadSummary();
      setMsg("Готово");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function postAction(path: string, body?: Record<string, unknown>) {
    const id = tg.trim();
    if (!id) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await api(`/admin/users/${encodeURIComponent(id)}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const t = await r.text();
      if (!r.ok) throw new Error(t);
      if (!t) setMsg("OK");
      else {
        try {
          setMsg(JSON.stringify(JSON.parse(t)));
        } catch {
          setMsg(t);
        }
      }
      await loadSummary();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const bal = data?.balance_usdt_minor as number | undefined;

  return (
    <>
      <h2>Пользователь по Telegram ID</h2>
      <p className="muted">
        Полный набор действий по ТЗ: статистика, обнуление, ручной депозит/вывод, рефералы, полное удаление записи
        пользователя.
      </p>
      {err ? <div className="err">{err}</div> : null}
      {msg ? <div className="ok">{msg}</div> : null}

      <div className="card">
        <form onSubmit={loadSummary}>
          <div className="row">
            <label htmlFor="tg">tg_user_id</label>
            <input id="tg" value={tg} onChange={(e) => setTg(e.target.value)} placeholder="например 123456789" />
          </div>
          <button type="submit" className="btn btn-primary">
            Загрузить
          </button>
        </form>
      </div>

      {data ? (
        <>
          <div className="card">
            <div className="topbar" style={{ marginBottom: "0.75rem" }}>
              <strong>Профиль</strong>
              <span className="muted">
                Баланс: {usdFromMinor(bal)} USDT · Депозитов (шт.): {depN} · Выводов (шт.): {wdN}
              </span>
            </div>
            <p>
              Бот заблокирован пользователем:{" "}
              <strong>{blocked ? `да (${fmtIso(String(data.blocked_bot_at ?? ""))})` : "нет"}</strong>
            </p>
            <div style={{ marginBottom: "0.75rem" }}>
              <button type="button" className="btn" disabled={busy} onClick={() => setBotBlock(false)}>
                Снять blocked_bot
              </button>{" "}
              <button type="button" className="btn btn-danger" disabled={busy} onClick={() => setBotBlock(true)}>
                Пометить blocked_bot
              </button>
            </div>
            <p className="muted" style={{ marginBottom: "0.5rem" }}>
              Код восстановления учётки в мини-аппе:{" "}
              <strong>{data.recovery_code_hash ? "уже был выдан (хэш в БД)" : "ещё не выдавался"}</strong>
            </p>
            <button type="button" className="btn" disabled={busy} onClick={() => void resetRecoveryCode()}>
              Сбросить код восстановления
            </button>
          </div>

          {ext ? (
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Сводная статистика</h3>
              <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                <div className="stat-box">
                  <div className="label">Сумма депозитов (gross)</div>
                  <div className="value">{usdFromMinor(ext.sum_deposits_gross_minor)}</div>
                </div>
                <div className="stat-box">
                  <div className="label">Сумма выводов (sent)</div>
                  <div className="value">{usdFromMinor(ext.sum_withdrawals_minor)}</div>
                </div>
                <div className="stat-box">
                  <div className="label">Реф. начислено</div>
                  <div className="value">{usdFromMinor(ext.referral_received_minor)}</div>
                </div>
                <div className="stat-box">
                  <div className="label">Приглашено юзеров</div>
                  <div className="value">{ext.invited_users_count}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Позиции бота (trade_positions)</h3>
            <p className="muted">
              Открытые и закрытые строки в SQLite. «Закрыть» проставляет <code>closed_at</code> — вкладки 7d/30d в миниапе
              сохраняют историю. «Удалить» — полное стирание.
            </p>
            <form onSubmit={addTradePosition} style={{ marginBottom: "1rem" }}>
              <div className="row">
                <label>Символ</label>
                <input value={tpSymbol} onChange={(e) => setTpSymbol(e.target.value)} placeholder="BTCUSDT" />
              </div>
              <div className="row">
                <label>Сторона</label>
                <select value={tpSide} onChange={(e) => setTpSide(e.target.value as "long" | "short")}>
                  <option value="long">long</option>
                  <option value="short">short</option>
                </select>
              </div>
              <div className="row">
                <label>Размер USDT</label>
                <input type="number" step="any" value={tpSizeUsd} onChange={(e) => setTpSizeUsd(e.target.value)} placeholder="100" />
              </div>
              <div className="row">
                <label>opened_at (ISO, опц.)</label>
                <input value={tpOpenedAt} onChange={(e) => setTpOpenedAt(e.target.value)} placeholder="пусто = сейчас" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                Добавить позицию
              </button>
            </form>
            {tradePositions.length === 0 ? (
              <p className="muted">Нет записей.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "0.35rem 0.5rem" }}>Символ</th>
                      <th style={{ padding: "0.35rem 0.5rem" }}>Сторона</th>
                      <th style={{ padding: "0.35rem 0.5rem" }}>Размер</th>
                      <th style={{ padding: "0.35rem 0.5rem" }}>Открыта</th>
                      <th style={{ padding: "0.35rem 0.5rem" }}>Закрыта</th>
                      <th style={{ padding: "0.35rem 0.5rem" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {tradePositions.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "0.35rem 0.5rem" }}>{p.symbol}</td>
                        <td style={{ padding: "0.35rem 0.5rem" }}>{p.side}</td>
                        <td style={{ padding: "0.35rem 0.5rem" }}>{usdFromMinor(p.size_minor)} USDT</td>
                        <td style={{ padding: "0.35rem 0.5rem", whiteSpace: "nowrap" }}>{fmtIso(p.opened_at)}</td>
                        <td style={{ padding: "0.35rem 0.5rem", whiteSpace: "nowrap" }}>
                          {p.closed_at ? fmtIso(p.closed_at) : "— открыта —"}
                        </td>
                        <td style={{ padding: "0.35rem 0.5rem", whiteSpace: "nowrap" }}>
                          {!p.closed_at ? (
                            <button
                              type="button"
                              className="btn"
                              disabled={busy}
                              onClick={() => void postTradePositionClose(p.id)}
                            >
                              Закрыть
                            </button>
                          ) : null}{" "}
                          <button
                            type="button"
                            className="btn btn-danger"
                            disabled={busy}
                            onClick={() => void deleteTradePositionHard(p.id)}
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>1) Обнулить баланс</h3>
            <button type="button" className="btn btn-danger" disabled={busy} onClick={() => postAction("/reset-balance")}>
              Обнулить баланс
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>2) Ручной депозит (зачисление по правилам комиссий)</h3>
            <div className="row">
              <label>Сумма USDT (gross)</label>
              <input type="number" step="any" value={depAmt} onChange={(e) => setDepAmt(e.target.value)} />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => postAction("/manual-deposit", { gross_usdt: Number(depAmt) })}
            >
              Зачислить депозит
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>3) Ручной вывод (создаёт заявку / автоотправку как в обычном потоке)</h3>
            <div className="row">
              <label>Адрес TRC20</label>
              <input value={wdAddr} onChange={(e) => setWdAddr(e.target.value)} />
            </div>
            <div className="row">
              <label>Сумма USDT</label>
              <input type="number" step="any" value={wdAmt} onChange={(e) => setWdAmt(e.target.value)} />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() =>
                postAction("/manual-withdraw", { to_address: wdAddr.trim(), amount_usdt: Number(wdAmt) })
              }
            >
              Создать вывод
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>4) Привязать рефералов (inviter = этот tg)</h3>
            <p className="muted">Список tg через запятую. Уже с пригласителем не трогаем, если не включить «принудительно».</p>
            <div className="row">
              <label>Дочерние tg_user_id</label>
              <input value={childTgs} onChange={(e) => setChildTgs(e.target.value)} placeholder="111,222,333" />
            </div>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                type="checkbox"
                id="forceRef"
                checked={attachForce}
                onChange={(e) => setAttachForce(e.target.checked)}
              />
              Принудительно перезаписать пригласителя
            </label>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() =>
                postAction("/attach-referrals", {
                  child_tg_ids: childTgs.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean),
                  force: attachForce
                })
              }
            >
              Привязать
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>5) Реф. бонус вручную</h3>
            <p className="muted">Зачисление на этого пользователя с записью в referral_payouts (from = указанный реферер).</p>
            <div className="row">
              <label>tg реферера (from)</label>
              <input value={refReferrer} onChange={(e) => setRefReferrer(e.target.value)} />
            </div>
            <div className="row">
              <label>Сумма USDT</label>
              <input type="number" step="any" value={refAmt} onChange={(e) => setRefAmt(e.target.value)} />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() =>
                postAction("/referral-credit", {
                  referrer_tg_id: refReferrer.trim(),
                  amount_usdt: Number(refAmt)
                })
              }
            >
              Начислить реф. бонус
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>6) Полное удаление пользователя из БД</h3>
            <p className="muted danger-text">
              Удаляет пользователя и связанные депозиты/выводы (CASCADE). Введите DELETE_USER для подтверждения.
            </p>
            <div className="row">
              <label>Подтверждение</label>
              <input value={wipeConfirm} onChange={(e) => setWipeConfirm(e.target.value)} placeholder="DELETE_USER" />
            </div>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy || wipeConfirm !== "DELETE_USER"}
              onClick={() => postAction("/wipe", { confirm: "DELETE_USER" })}
            >
              Удалить пользователя навсегда
            </button>
          </div>

          <details>
            <summary style={{ cursor: "pointer", color: "var(--muted)" }}>Raw user (JSON)</summary>
            <pre style={{ fontSize: 11, overflow: "auto", maxHeight: 320 }}>{JSON.stringify(data, null, 2)}</pre>
          </details>
        </>
      ) : null}
    </>
  );
}
