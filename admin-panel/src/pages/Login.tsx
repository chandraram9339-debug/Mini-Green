import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, setAdminKey } from "../api";

export default function Login() {
  const [key, setK] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? "/";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setAdminKey(key.trim());
    const r = await api("/admin/health");
    if (!r.ok) {
      setErr(r.status === 401 ? "Неверный ключ" : await r.text());
      return;
    }
    nav(from, { replace: true });
  }

  return (
    <div className="login-page">
      <h1>Вход в админ-панель</h1>
      <p className="muted">Укажите тот же ключ, что задан в ADMIN_API_KEY на сервере.</p>
      <form onSubmit={onSubmit}>
        <div className="row">
          <label htmlFor="k">X-Admin-Key</label>
          <input
            id="k"
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setK(e.target.value)}
            placeholder="ключ"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: "0.75rem" }}>
          Войти
        </button>
        {err ? <div className="err">{err}</div> : null}
      </form>
    </div>
  );
}
