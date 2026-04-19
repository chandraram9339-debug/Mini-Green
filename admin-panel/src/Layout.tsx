import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAdminKey } from "./api";

const links = [
  { to: "/", label: "Статистика", end: true },
  { to: "/deposits", label: "Депозиты" },
  { to: "/withdrawals", label: "Выводы" },
  { to: "/withdrawals-requests", label: "Заявки на вывод" },
  { to: "/referral", label: "Рефералка" },
  { to: "/meta", label: "Meta Pixel" },
  { to: "/push", label: "Пуши и рассылки" },
  { to: "/fees", label: "Комиссии и кошельки" },
  { to: "/content", label: "Контент" },
  { to: "/user", label: "Пользователь" },
  { to: "/integrations", label: "Интеграции" },
  { to: "/test-transactions", label: "Тестовые транзакции" }
];

export default function Layout() {
  const nav = useNavigate();
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Админ-панель</h1>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: "1rem", marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              clearAdminKey();
              nav("/login");
            }}
          >
            Выйти
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
