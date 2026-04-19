import { FormEvent, useEffect, useState } from "react";
import { apiJson } from "../api";
import type { AdminConfigResponse, BroadcastRow, FeePolicy } from "../types";
import { fmtIso } from "../util";

const PAGE = 30;

function flag01(s: string | undefined) {
  return s === "1" || s === "true";
}

export default function Push() {
  const [segment, setSegment] = useState("all");
  const [text, setText] = useState("");
  const [sentRes, setSentRes] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [bTotal, setBTotal] = useState(0);
  const [bOff, setBOff] = useState(0);

  const [cfg, setCfg] = useState<AdminConfigResponse | null>(null);
  const [cooldown, setCooldown] = useState("");
  const [tNoDep, setTNoDep] = useState("");
  const [tDep, setTDep] = useState("");
  const [tAll, setTAll] = useState("");
  const [enNo, setEnNo] = useState(false);
  const [enDep, setEnDep] = useState(false);
  const [enAll, setEnAll] = useState(false);
  const [autoMsg, setAutoMsg] = useState("");

  function loadConfig() {
    apiJson<AdminConfigResponse>("/admin/config")
      .then((c) => {
        setCfg(c);
        const m = c.app_config;
        setCooldown(m.push_auto_cooldown_hours ?? "");
        setTNoDep(m.push_auto_text_no_deposit ?? "");
        setTDep(m.push_auto_text_deposited ?? "");
        setTAll(m.push_auto_text_all ?? "");
        setEnNo(flag01(m.push_auto_no_deposit_enabled));
        setEnDep(flag01(m.push_auto_deposited_enabled));
        setEnAll(flag01(m.push_auto_all_enabled));
      })
      .catch((e: Error) => setErr(e.message));
  }

  function loadBroadcasts(offset: number) {
    apiJson<{ items: BroadcastRow[]; total: number }>(`/admin/broadcasts?limit=${PAGE}&offset=${offset}`)
      .then((r) => {
        setBroadcasts(r.items);
        setBTotal(r.total);
        setBOff(offset);
      })
      .catch((e: Error) => setErr(e.message));
  }

  useEffect(() => {
    loadConfig();
    loadBroadcasts(0);
  }, []);

  async function sendManual(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setSentRes(null);
    try {
      const r = await apiJson<{ ok: boolean; sent: number }>("/admin/notify", {
        method: "POST",
        body: JSON.stringify({ segment, text })
      });
      setSentRes(`Отправлено сообщений: ${r.sent}`);
      setText("");
      loadBroadcasts(bOff);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function saveAuto(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setAutoMsg("");
    try {
      await apiJson<{ ok: boolean; current: FeePolicy }>("/admin/config", {
        method: "PATCH",
        body: JSON.stringify({
          push_auto_no_deposit_enabled: enNo,
          push_auto_deposited_enabled: enDep,
          push_auto_all_enabled: enAll,
          push_auto_cooldown_hours: cooldown === "" ? undefined : Number(cooldown),
          push_auto_text_no_deposit: tNoDep,
          push_auto_text_deposited: tDep,
          push_auto_text_all: tAll
        })
      });
      setAutoMsg("Настройки авто-пушей сохранены");
      loadConfig();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      <h2>Пуши и рассылки</h2>
      {err ? <div className="err">{err}</div> : null}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Ручная рассылка в Telegram</h3>
        <form onSubmit={sendManual}>
          <div className="row">
            <label htmlFor="seg">Сегмент</label>
            <select id="seg" value={segment} onChange={(e) => setSegment(e.target.value)} style={{ maxWidth: 280 }}>
              <option value="all">Все (не заблокировали бота)</option>
              <option value="deposited">С депозитом</option>
              <option value="no_deposit">Без депозита</option>
            </select>
          </div>
          <div className="row">
            <label htmlFor="txt">Текст</label>
            <textarea id="txt" value={text} onChange={(e) => setText(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">
            Отправить
          </button>
          {sentRes ? <span className="ok" style={{ marginLeft: "1rem" }}>{sentRes}</span> : null}
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Авто-пуши (флаги и тексты в app_config)</h3>
        <p className="muted">
          Итоговая отправка выполняется планировщиком (cron) на бэкенде: прогресс и фактическая доставка отражаются
          после срабатывания задачи, а не мгновенно при сохранении формы. Здесь редактируются параметры и тексты.
        </p>
        {autoMsg ? <div className="ok" style={{ marginBottom: "0.5rem" }}>{autoMsg}</div> : null}
        <form onSubmit={saveAuto}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input type="checkbox" checked={enNo} onChange={(e) => setEnNo(e.target.checked)} />
            push_auto_no_deposit_enabled
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input type="checkbox" checked={enDep} onChange={(e) => setEnDep(e.target.checked)} />
            push_auto_deposited_enabled
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <input type="checkbox" checked={enAll} onChange={(e) => setEnAll(e.target.checked)} />
            push_auto_all_enabled
          </label>
          <div className="row">
            <label htmlFor="cd">push_auto_cooldown_hours</label>
            <input id="cd" type="number" value={cooldown} onChange={(e) => setCooldown(e.target.value)} />
          </div>
          <div className="row">
            <label>Текст: без депозита</label>
            <textarea value={tNoDep} onChange={(e) => setTNoDep(e.target.value)} />
          </div>
          <div className="row">
            <label>Текст: с депозитом</label>
            <textarea value={tDep} onChange={(e) => setTDep(e.target.value)} />
          </div>
          <div className="row">
            <label>Текст: все</label>
            <textarea value={tAll} onChange={(e) => setTAll(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">
            Сохранить авто-пуши
          </button>
        </form>
        {cfg ? (
          <pre
            style={{
              marginTop: "1rem",
              fontSize: 11,
              background: "#f0f2f5",
              padding: "0.75rem",
              borderRadius: 6,
              overflow: "auto",
              maxHeight: 200
            }}
          >
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(cfg.app_config).filter(([k]) => k.startsWith("push_auto") || k.startsWith("push_"))
              ),
              null,
              2
            )}
          </pre>
        ) : null}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>История рассылок (лог)</h3>
        <p className="muted">Всего записей: {bTotal}</p>
        <div style={{ overflowX: "auto" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Время</th>
                <th>Сегмент</th>
                <th>Отправлено</th>
                <th>Превью текста</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.map((b) => (
                <tr key={b.id}>
                  <td>{fmtIso(b.created_at)}</td>
                  <td>{b.segment}</td>
                  <td>{b.sent_count}</td>
                  <td style={{ maxWidth: 360, wordBreak: "break-word" }}>{b.text_preview}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button type="button" className="btn" disabled={bOff <= 0} onClick={() => loadBroadcasts(Math.max(0, bOff - PAGE))}>
            Назад
          </button>
          <button
            type="button"
            className="btn"
            disabled={bOff + PAGE >= bTotal}
            onClick={() => loadBroadcasts(bOff + PAGE)}
          >
            Вперёд
          </button>
        </div>
      </div>
    </>
  );
}
