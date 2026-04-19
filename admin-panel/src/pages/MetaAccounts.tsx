import { FormEvent, useEffect, useState } from "react";
import { api, apiJson } from "../api";
import type { MetaAccountRow } from "../types";

export default function MetaAccounts() {
  const [items, setItems] = useState<MetaAccountRow[]>([]);
  const [err, setErr] = useState("");
  const [label, setLabel] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [token, setToken] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    apiJson<{ items: MetaAccountRow[] }>("/admin/meta-accounts")
      .then((r) => setItems(r.items))
      .catch((e: Error) => setErr(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setErr("");
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
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить аккаунт Meta?")) return;
    setBusy(id);
    setErr("");
    try {
      const r = await api(`/admin/meta-accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
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
        Токен хранится на сервере; здесь только создание и список. После добавления токен не показывается повторно.
      </p>
      {err ? <div className="err">{err}</div> : null}

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
                  <button type="button" className="btn btn-danger" disabled={busy === m.id} onClick={() => remove(m.id)}>
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
