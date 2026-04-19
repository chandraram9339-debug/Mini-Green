import { useEffect, useState } from "react";
import { apiJson } from "../api";
import type { StatsResponse } from "../types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-box">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

export default function Stats() {
  const [s, setS] = useState<StatsResponse | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiJson<StatsResponse>("/admin/stats")
      .then(setS)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <>
        <h2>Статистика</h2>
        <div className="err">{err}</div>
      </>
    );
  }
  if (!s) {
    return (
      <>
        <h2>Статистика</h2>
        <p className="muted">Загрузка…</p>
      </>
    );
  }

  const uw = (k: keyof StatsResponse["unique_new_users"]) => s.unique_new_users[k];
  const wb = (k: keyof StatsResponse["users_blocked_bot"]) => s.users_blocked_bot[k];
  const md = (k: keyof StatsResponse["users_made_deposit"]) => s.users_made_deposit[k];
  const ma = (k: keyof StatsResponse["mau_dau_window"]) => s.mau_dau_window[k];

  return (
    <>
      <div className="topbar">
        <h2 style={{ margin: 0 }}>Статистика</h2>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Агрегаты</h3>
        <div className="stats-grid">
          <StatCard label="Сумма депозитов, USD" value={s.sum_deposits_usd} />
          <StatCard label="Сумма выводов, USD" value={s.sum_withdrawals_usd} />
          <StatCard label="Средний депозит (на пользователя с депозитом)" value={s.avg_deposit_usd} />
          <StatCard label="Средний вывод на пользователя выводивших" value={s.avg_withdraw_usd} />
          <StatCard label="Депозитов всего (строк)" value={s.deposit_count_total} />
          <StatCard label="Среднее депозитов на депозитора" value={s.avg_deposits_per_depositor} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Новые пользователи</h3>
        <div className="stats-grid">
          <StatCard label="1 день" value={uw("d1")} />
          <StatCard label="3 дня" value={uw("d3")} />
          <StatCard label="7 дней" value={uw("d7")} />
          <StatCard label="30 дней" value={uw("d30")} />
          <StatCard label="Всего" value={uw("all")} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Заблокировали бота</h3>
        <div className="stats-grid">
          <StatCard label="1 день" value={wb("d1")} />
          <StatCard label="3 дня" value={wb("d3")} />
          <StatCard label="7 дней" value={wb("d7")} />
          <StatCard label="30 дней" value={wb("d30")} />
          <StatCard label="Всего" value={wb("all")} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Сделали депозит (уникальные)</h3>
        <div className="stats-grid">
          <StatCard label="1 день" value={md("d1")} />
          <StatCard label="3 дня" value={md("d3")} />
          <StatCard label="7 дней" value={md("d7")} />
          <StatCard label="30 дней" value={md("d30")} />
          <StatCard label="Когда-либо" value={md("all")} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Активность (last_active)</h3>
        <div className="stats-grid">
          <StatCard label="DAU (1д)" value={ma("d1")} />
          <StatCard label="3 дня" value={ma("d3")} />
          <StatCard label="7 дней" value={ma("d7")} />
          <StatCard label="30 дней (MAU)" value={ma("d30")} />
        </div>
      </div>
    </>
  );
}
