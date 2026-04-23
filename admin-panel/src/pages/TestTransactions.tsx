import { FormEvent, useState } from "react";
import { apiJson } from "../api";
import { usdFromMinor } from "../util";

type UserLite = {
  tg_user_id: string;
  balance_usdt_minor: number;
  deposit_tron_address: string | null;
};

export default function TestTransactions() {
  const [tg, setTg] = useState("");
  const [user, setUser] = useState<UserLite | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [depGrossUsdt, setDepGrossUsdt] = useState("");
  const [depFromWallet, setDepFromWallet] = useState("");
  const [wdAmountUsdt, setWdAmountUsdt] = useState("");
  const [wdToAddr, setWdToAddr] = useState("");
  const [refCount, setRefCount] = useState("1");
  const [refAmountUsdt, setRefAmountUsdt] = useState("");

  async function findUser(e?: FormEvent) {
    e?.preventDefault();
    const id = tg.trim();
    setErr("");
    setMsg("");
    setUser(null);
    if (!id) return;
    setBusy(true);
    try {
      const r = await apiJson<UserLite>(`/admin/test-transactions/user/${encodeURIComponent(id)}`);
      setUser(r);
      setMsg("Пользователь найден.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function submitTestDeposit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErr("");
    setMsg("");
    const gross = Number(depGrossUsdt.replace(",", "."));
    const from = depFromWallet.trim();
    if (!Number.isFinite(gross) || gross <= 0) {
      setErr("Укажите сумму пополнения (USDT).");
      return;
    }
    if (!from) {
      setErr("Укажите TRC20-адрес отправителя.");
      return;
    }
    setBusy(true);
    try {
      const r = await apiJson<{ ok: boolean; deposit_id: string | null; net_minor: number; fee_minor: number }>(
        "/admin/test-transactions/deposit",
        {
          method: "POST",
          body: JSON.stringify({
            tg_user_id: user.tg_user_id,
            gross_usdt: gross,
            from_wallet: from
          })
        }
      );
      setMsg(
        `Тестовый депозит создан: ${r.deposit_id ?? "—"}, net ${usdFromMinor(r.net_minor)} USDT, комиссия ${usdFromMinor(r.fee_minor)} USDT. В мини-аппе в истории появится строка с указанным кошельком и временем.`
      );
      setDepGrossUsdt("");
      const u2 = await apiJson<UserLite>(
        `/admin/test-transactions/user/${encodeURIComponent(user.tg_user_id)}`
      );
      setUser(u2);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function submitTestReferral(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErr("");
    setMsg("");
    const count = Math.round(Number(refCount));
    const amt = Number(refAmountUsdt.replace(",", "."));
    if (!Number.isFinite(count) || count < 1 || count > 100) {
      setErr("Количество рефералов: от 1 до 100.");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setErr("Укажите сумму вознаграждения за одного реферала (USDT).");
      return;
    }
    setBusy(true);
    try {
      const r = await apiJson<{ ok: boolean; count: number; total_minor: number }>(
        "/admin/test-transactions/referral",
        {
          method: "POST",
          body: JSON.stringify({
            tg_user_id: user.tg_user_id,
            count,
            amount_per_referral_usdt: amt
          })
        }
      );
      setMsg(
        `Добавлено ${r.count} реф. выплат. Итого зачислено: ${usdFromMinor(r.total_minor)} USDT. В мини-аппе → История → Рефералы появятся строки.`
      );
      setRefCount("1");
      setRefAmountUsdt("");
      const u2 = await apiJson<UserLite>(`/admin/test-transactions/user/${encodeURIComponent(user.tg_user_id)}`);
      setUser(u2);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function submitTestWithdraw(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErr("");
    setMsg("");
    const amt = Number(wdAmountUsdt.replace(",", "."));
    const to = wdToAddr.trim();
    if (!Number.isFinite(amt) || amt <= 0) {
      setErr("Укажите сумму вывода (USDT).");
      return;
    }
    if (!to) {
      setErr("Укажите TRC20-адрес получателя.");
      return;
    }
    setBusy(true);
    try {
      const r = await apiJson<{ ok: boolean; withdrawal_id: string }>("/admin/test-transactions/withdraw", {
        method: "POST",
        body: JSON.stringify({
          tg_user_id: user.tg_user_id,
          amount_usdt: amt,
          to_address: to
        })
      });
      setMsg(`Тестовый вывод записан как «отправлен»: ${r.withdrawal_id}. Комиссия считается по правилам из «Комиссии».`);
      setWdAmountUsdt("");
      setWdToAddr("");
      const u2 = await apiJson<UserLite>(
        `/admin/test-transactions/user/${encodeURIComponent(user.tg_user_id)}`
      );
      setUser(u2);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h2>Тестовые транзакции</h2>
      <p className="muted">
        Отладка SIB: создаются полные строки в БД (депозиты и выводы со статусом «отправлен»), комиссии берутся из политики
        системы, без заявки в очередь выводов и без отправки в сеть. Telegram и Meta для тестового депозита не вызываются.
      </p>
      {err ? <div className="err">{err}</div> : null}
      {msg ? <div className="ok" style={{ marginBottom: "0.75rem" }}>{msg}</div> : null}

      <div className="card">
        <form onSubmit={findUser}>
          <div className="row">
            <label htmlFor="tt-tg">Telegram ID пользователя</label>
            <input
              id="tt-tg"
              type="text"
              placeholder="Например 123456789"
              value={tg}
              onChange={(e) => setTg(e.target.value)}
              disabled={busy}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Найти
          </button>
        </form>
      </div>

      {user ? (
        <>
          <div className="card">
            <p>
              <strong>Выбран:</strong> <code>{user.tg_user_id}</code>
            </p>
            <p className="muted" style={{ marginTop: "0.35rem" }}>
              Баланс: <strong>{usdFromMinor(user.balance_usdt_minor)} USDT</strong>
              {user.deposit_tron_address ? (
                <>
                  {" "}
                  · депозитный адрес пользователя: <code>{user.deposit_tron_address}</code>
                </>
              ) : null}
            </p>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Тестовое пополнение</h3>
            <p className="muted">
              Gross-сумма в USDT → в БД попадают сумма брутто, автоматический расчёт комиссии депозита, зачисление на
              баланс (net). Поле «кошелёк отправителя» сохраняется как источник и отображается во фронте мини-аппа в
              истории операций.
            </p>
            <form onSubmit={submitTestDeposit}>
              <div className="row">
                <label>Сумма пополнения (gross), USDT</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Например 50"
                  value={depGrossUsdt}
                  onChange={(e) => setDepGrossUsdt(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="row">
                <label>Кошелёк отправителя (TRC20)</label>
                <input
                  type="text"
                  placeholder="T…"
                  value={depFromWallet}
                  onChange={(e) => setDepFromWallet(e.target.value)}
                  disabled={busy}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                Зачислить тестовый депозит
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Тестовый вывод</h3>
            <p className="muted">
              Запись в таблице выводов со статусом «отправлен», списание суммы и комиссии вывода с баланса (без ончейн-транзакции).
              Подтверждение в очереди выводов не требуется.
            </p>
            <form onSubmit={submitTestWithdraw}>
              <div className="row">
                <label>Сумма вывода (до комиссии), USDT</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Например 10"
                  value={wdAmountUsdt}
                  onChange={(e) => setWdAmountUsdt(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="row">
                <label>Адрес получателя (TRC20)</label>
                <input
                  type="text"
                  placeholder="T…"
                  value={wdToAddr}
                  onChange={(e) => setWdToAddr(e.target.value)}
                  disabled={busy}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                Записать тестовый вывод
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Тестовые рефералы</h3>
            <p className="muted">
              Добавляет N записей в таблицу реферальных выплат и зачисляет сумму на баланс пользователя.
              В мини-аппе → История → вкладка «Рефералы» появятся строки с суммой вознаграждения.
            </p>
            <form onSubmit={submitTestReferral}>
              <div className="row">
                <label>Количество рефералов</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Например 3"
                  value={refCount}
                  onChange={(e) => setRefCount(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="row">
                <label>Вознаграждение за одного реферала, USDT</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Например 5"
                  value={refAmountUsdt}
                  onChange={(e) => setRefAmountUsdt(e.target.value)}
                  disabled={busy}
                />
              </div>
              <p className="muted" style={{ marginTop: "0.4rem" }}>
                Итого будет зачислено:{" "}
                <strong>
                  {(Number(refCount) > 0 && Number(refAmountUsdt.replace(",", ".")) > 0)
                    ? `${(Number(refCount) * Number(refAmountUsdt.replace(",", "."))).toFixed(2)} USDT`
                    : "—"}
                </strong>
              </p>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                Добавить тестовые рефералы
              </button>
            </form>
          </div>
        </>
      ) : null}
    </>
  );
}
