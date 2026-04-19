import { useEffect, useState } from "react";
import { apiJson } from "../api";
import type { DepositRow } from "../types";
import { depositStatusRu, fmtIso, usdFromMinor } from "../util";

const PAGE = 50;

export default function Deposits() {
  const [items, setItems] = useState<DepositRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [err, setErr] = useState("");

  function load(o: number) {
    setErr("");
    apiJson<{ items: DepositRow[]; total: number }>(`/admin/deposits?limit=${PAGE}&offset=${o}`)
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
        setOffset(o);
      })
      .catch((e: Error) => setErr(e.message));
  }

  useEffect(() => {
    load(0);
  }, []);

  return (
    <>
      <div className="topbar">
        <h2 style={{ margin: 0 }}>Депозиты</h2>
        <span className="muted">
          Всего записей: {total}. Страница {Math.floor(offset / PAGE) + 1}
        </span>
      </div>
      {err ? <div className="err">{err}</div> : null}
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Ид.</th>
              <th>TG</th>
              <th>Сумма</th>
              <th>Комиссия</th>
              <th>К зачислению</th>
              <th>Статус</th>
              <th>Создан</th>
              <th>Завершён</th>
              <th>Источник</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td style={{ fontFamily: "monospace", fontSize: 11 }}>{d.id.slice(0, 12)}…</td>
                <td>{d.tg}</td>
                <td>{usdFromMinor(d.gross_minor)}</td>
                <td>{usdFromMinor(d.fee_minor)}</td>
                <td>{usdFromMinor(d.net_minor)}</td>
                <td>{depositStatusRu(String(d.status))}</td>
                <td>{fmtIso(d.created_at)}</td>
                <td>{fmtIso(d.completed_at ?? "")}</td>
                <td>{d.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" className="btn" disabled={offset <= 0} onClick={() => load(Math.max(0, offset - PAGE))}>
          Назад
        </button>
        <button
          type="button"
          className="btn"
          disabled={offset + PAGE >= total}
          onClick={() => load(offset + PAGE)}
        >
          Вперёд
        </button>
      </div>
    </>
  );
}
