import { FormEvent, useEffect, useState } from "react";
import { api, apiJson } from "../api";
import type { WithdrawalRow } from "../types";
import { fmtIso, usdFromMinor, withdrawalStatusRu } from "../util";

const statuses = [
  { value: "", label: "Все" },
  { value: "pending_approval", label: "Ожидают решения" },
  { value: "approved", label: "Одобрено" },
  { value: "sent", label: "Отправлено" },
  { value: "rejected", label: "Отклонено" }
];

type Props = { defaultFilter?: string };

export default function Withdrawals({ defaultFilter = "pending_approval" }: Props) {
  const [filter, setFilter] = useState(defaultFilter);
  const [items, setItems] = useState<WithdrawalRow[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("rejected");

  function load() {
    setErr("");
    const q = filter ? `?status=${encodeURIComponent(filter)}` : "";
    apiJson<{ items: WithdrawalRow[] }>(`/admin/withdrawals${q}`)
      .then((r) => setItems(r.items))
      .catch((e: Error) => setErr(e.message));
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function approve(id: string) {
    setBusy(id);
    setErr("");
    try {
      const r = await api(`/admin/withdrawals/${encodeURIComponent(id)}/approve`, { method: "POST" });
      if (!r.ok) throw new Error(await r.text());
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function reject(e: FormEvent, id: string) {
    e.preventDefault();
    setBusy(id);
    setErr("");
    try {
      const r = await api(`/admin/withdrawals/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason })
      });
      if (!r.ok) throw new Error(await r.text());
      setRejectId(null);
      load();
    } catch (err2: unknown) {
      setErr(err2 instanceof Error ? err2.message : String(err2));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="topbar">
        <h2 style={{ margin: 0 }}>
          {defaultFilter === "" ? "Все выводы" : "Заявки на вывод"}
        </h2>
        <div className="row" style={{ margin: 0 }}>
          <label htmlFor="st">Статус</label>
          <select id="st" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 240 }}>
            {statuses.map((s) => (
              <option key={s.value || "all"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {err ? <div className="err">{err}</div> : null}
      <p className="muted">
        Для заявок в статусе «ожидают решения» доступны одобрение (списание с баланса и перевод в «отправлено») и
        отклонение.
      </p>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Ид.</th>
              <th>TG</th>
              <th>Сумма</th>
              <th>Комиссия</th>
              <th>Адрес</th>
              <th>Статус</th>
              <th>Создан</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => (
              <tr key={w.id}>
                <td style={{ fontFamily: "monospace", fontSize: 11 }}>{String(w.id).slice(0, 14)}…</td>
                <td>{String(w.tg ?? "")}</td>
                <td>{usdFromMinor(w.amount_minor as number)}</td>
                <td>{usdFromMinor(w.fee_minor as number)}</td>
                <td style={{ maxWidth: 140, wordBreak: "break-all", fontSize: 11 }}>
                  {String(w.to_address ?? "")}
                </td>
                <td>{withdrawalStatusRu(String(w.status))}</td>
                <td>{fmtIso(w.created_at as string)}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {(w.status === "pending_approval" || w.status === "approved") && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={busy === w.id}
                        onClick={() => approve(w.id)}
                      >
                        Одобрить и отправить
                      </button>{" "}
                      <button type="button" className="btn btn-danger" onClick={() => setRejectId(w.id)}>
                        Отклонить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejectId ? (
        <div className="card">
          <form onSubmit={(e) => reject(e, rejectId)}>
            <strong>Отклонить {rejectId}</strong>
            <div className="row" style={{ marginTop: "0.75rem" }}>
              <label htmlFor="reason">Причина</label>
              <input id="reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-danger" disabled={busy === rejectId}>
              Подтвердить отклонение
            </button>{" "}
            <button type="button" className="btn" onClick={() => setRejectId(null)}>
              Отмена
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
