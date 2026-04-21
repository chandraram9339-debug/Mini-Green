import { FormEvent, useEffect, useState } from "react";
import { apiJson } from "../api";
import type { AdminConfigResponse, FeePolicy, WalletHealthEntry, WalletHealthResponse } from "../types";

function fmtWalletAmount(value: number | null, suffix: string): string {
  if (value == null) return "—";
  return `${value} ${suffix}`;
}

function HealthCard({ title, entry }: { title: string; entry: WalletHealthEntry }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 320 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p className={entry.ok ? "ok" : "err"} style={{ marginTop: 0 }}>
        {entry.ok ? "Баланс в норме" : "Есть предупреждения"}
      </p>
      <table className="data">
        <tbody>
          <tr>
            <td>Label</td>
            <td>{entry.label || "—"}</td>
          </tr>
          <tr>
            <td>Address</td>
            <td style={{ maxWidth: 220, wordBreak: "break-all" }}>{entry.address ?? "—"}</td>
          </tr>
          <tr>
            <td>Address source</td>
            <td>{entry.address_source}</td>
          </tr>
          <tr>
            <td>TRX</td>
            <td>{fmtWalletAmount(entry.trx_balance_trx, "TRX")}</td>
          </tr>
          <tr>
            <td>USDT</td>
            <td>{fmtWalletAmount(entry.usdt_balance_usdt, "USDT")}</td>
          </tr>
        </tbody>
      </table>
      {entry.alerts.length > 0 ? (
        <ul style={{ marginBottom: 0 }}>
          {entry.alerts.map((alert, index) => (
            <li key={`${entry.key}-${index}`}>{alert}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function FeesAndWallets() {
  const [policy, setPolicy] = useState<FeePolicy | null>(null);
  const [appConfig, setAppConfig] = useState<Record<string, string>>({});
  const [walletHealth, setWalletHealth] = useState<WalletHealthResponse | null>(null);

  const [minDepositUsdt, setMinDepositUsdt] = useState("");
  const [depositFeeFixedUsdt, setDepositFeeFixedUsdt] = useState("");
  const [depositFeeBps, setDepositFeeBps] = useState("");
  const [withdrawFeeFixedUsdt, setWithdrawFeeFixedUsdt] = useState("");
  const [withdrawFeeBps, setWithdrawFeeBps] = useState("");
  const [metaPurchaseMinUsdt, setMetaPurchaseMinUsdt] = useState("");
  const [withdrawAutoApprove, setWithdrawAutoApprove] = useState(false);

  const [gazBankTron, setGazBankTron] = useState("");
  const [topupBankTron, setTopupBankTron] = useState("");
  const [withdrawWalletTron, setWithdrawWalletTron] = useState("");
  const [treasuryDepositTron, setTreasuryDepositTron] = useState("");
  const [deterministicDeriveKey, setDeterministicDeriveKey] = useState("");
  const [hdMnemonic, setHdMnemonic] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    apiJson<AdminConfigResponse>("/admin/config")
      .then((c) => {
        setPolicy(c.policy);
        setAppConfig(c.app_config);
        const p = c.policy;
        setMinDepositUsdt(String(p.minDepositUsdt));
        setDepositFeeFixedUsdt(String(p.depositFeeFixedUsdt));
        setDepositFeeBps(String(p.depositFeeBps));
        setWithdrawFeeFixedUsdt(String(p.withdrawFeeFixedUsdt));
        setWithdrawFeeBps(String(p.withdrawFeeBps));
        setMetaPurchaseMinUsdt(String(p.metaPurchaseMinUsdt));
        const m = c.app_config;
        setGazBankTron(m.gaz_bank_tron ?? "");
        setTopupBankTron(m.topup_bank_tron ?? "");
        setWithdrawWalletTron(m.withdraw_wallet_tron ?? "");
        setTreasuryDepositTron(m.treasury_deposit_tron ?? "");
        setDeterministicDeriveKey(m.deterministic_derive_key ?? "");
        setHdMnemonic("");
        const wa = m.withdraw_auto_approve;
        setWithdrawAutoApprove(wa === "1" || wa === "true");
      })
      .catch((e: Error) => setErr(e.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const loadWalletHealth = () => {
      apiJson<WalletHealthResponse>("/admin/wallet-health")
        .then((payload) => {
          if (!cancelled) setWalletHealth(payload);
        })
        .catch((e: Error) => {
          if (!cancelled) setErr(e.message);
        });
    };

    loadWalletHealth();
    timer = window.setInterval(loadWalletHealth, 30000);
    return () => {
      cancelled = true;
      if (timer != null) window.clearInterval(timer);
    };
  }, []);

  async function saveFees(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const r = await apiJson<{ ok: boolean; current: FeePolicy }>("/admin/config", {
        method: "PATCH",
        body: JSON.stringify({
          min_deposit_usdt: Number(minDepositUsdt),
          deposit_fee_fixed_usdt: Number(depositFeeFixedUsdt),
          deposit_fee_bps: Number(depositFeeBps),
          withdraw_fee_fixed_usdt: Number(withdrawFeeFixedUsdt),
          withdraw_fee_bps: Number(withdrawFeeBps),
          meta_purchase_min_usdt: Number(metaPurchaseMinUsdt)
        })
      });
      setPolicy(r.current);
      setMsg("Комиссии и пороги сохранены");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function saveWallets(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const body: Record<string, string> = {
        gaz_bank_tron: gazBankTron,
        topup_bank_tron: topupBankTron,
        withdraw_wallet_tron: withdrawWalletTron,
        treasury_deposit_tron: treasuryDepositTron,
        deterministic_derive_key: deterministicDeriveKey
      };
      if (hdMnemonic.trim()) body.hd_wallet_mnemonic = hdMnemonic.trim();
      await apiJson("/admin/config", { method: "PATCH", body: JSON.stringify(body) });
      const c = await apiJson<AdminConfigResponse>("/admin/config");
      setAppConfig(c.app_config);
      setHdMnemonic("");
      setMsg("Кошельки и ключи обновлены (мнемоника после сохранения не отображается)");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function saveWithdrawPolicy(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await apiJson("/admin/config", {
        method: "PATCH",
        body: JSON.stringify({ withdraw_auto_approve: withdrawAutoApprove })
      });
      const c = await apiJson<AdminConfigResponse>("/admin/config");
      setAppConfig(c.app_config);
      setMsg("Политика авто-подтверждения выводов сохранена");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      <h2>Комиссии, пороги Meta и кошельки</h2>
      {err ? <div className="err">{err}</div> : null}
      {msg ? <div className="ok">{msg}</div> : null}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Мониторинг кошельков вывода</h3>
        <p className="muted">
          Блок обновляется автоматически каждые 30 секунд. Если на TRX или USDT-кошельках мало средств, здесь
          появится предупреждение, а пользовательский вывод будет отклонён с сообщением «try again later».
        </p>
        {walletHealth?.alerts.length ? (
          <div className="err" style={{ marginBottom: "0.75rem" }}>
            {walletHealth.alerts.join(" ")}
          </div>
        ) : (
          <div className="ok" style={{ marginBottom: "0.75rem" }}>
            Критичных предупреждений по кошелькам нет.
          </div>
        )}
        <div className="muted" style={{ marginBottom: "0.75rem" }}>
          LIVE_TRON_SEND: {walletHealth?.live_tron_send ? "enabled" : "disabled"} · проверено:{" "}
          {walletHealth?.checked_at ?? "—"}
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <HealthCard
            title="TRX gas wallet"
            entry={
              walletHealth?.gas_bank ?? {
                key: "gas_bank",
                label: "",
                address: null,
                address_source: "unresolved",
                trx_balance_sun: null,
                trx_balance_trx: null,
                usdt_balance_minor: null,
                usdt_balance_usdt: null,
                ok: false,
                alerts: ["Загрузка статуса..."],
              }
            }
          />
          <HealthCard
            title="Withdraw wallet"
            entry={
              walletHealth?.withdraw_wallet ?? {
                key: "withdraw_wallet",
                label: "",
                address: null,
                address_source: "unresolved",
                trx_balance_sun: null,
                trx_balance_trx: null,
                usdt_balance_minor: null,
                usdt_balance_usdt: null,
                ok: false,
                alerts: ["Загрузка статуса..."],
              }
            }
          />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Комиссии и лимиты</h3>
        <form onSubmit={saveFees}>
          <div className="row">
            <label>min_deposit_usdt</label>
            <input type="number" step="any" value={minDepositUsdt} onChange={(e) => setMinDepositUsdt(e.target.value)} />
          </div>
          <div className="row">
            <label>deposit_fee_fixed_usdt</label>
            <input
              type="number"
              step="any"
              value={depositFeeFixedUsdt}
              onChange={(e) => setDepositFeeFixedUsdt(e.target.value)}
            />
          </div>
          <div className="row">
            <label>deposit_fee_bps</label>
            <input type="number" value={depositFeeBps} onChange={(e) => setDepositFeeBps(e.target.value)} />
          </div>
          <div className="row">
            <label>withdraw_fee_fixed_usdt</label>
            <input
              type="number"
              step="any"
              value={withdrawFeeFixedUsdt}
              onChange={(e) => setWithdrawFeeFixedUsdt(e.target.value)}
            />
          </div>
          <div className="row">
            <label>withdraw_fee_bps</label>
            <input type="number" value={withdrawFeeBps} onChange={(e) => setWithdrawFeeBps(e.target.value)} />
          </div>
          <div className="row">
            <label>meta_purchase_min_usdt (порог для CAPI)</label>
            <input
              type="number"
              step="any"
              value={metaPurchaseMinUsdt}
              onChange={(e) => setMetaPurchaseMinUsdt(e.target.value)}
            />
          </div>
          {policy ? (
            <p className="muted">
              Снимок после сохранения: мин. депозит {policy.minDepositUsdt}, фикс комиссии депозита{" "}
              {policy.depositFeeFixedUsdt}, депозит bps {policy.depositFeeBps}, фикс комиссии вывода{" "}
              {policy.withdrawFeeFixedUsdt}, вывод bps {policy.withdrawFeeBps}, порог Meta (CAPI){" "}
              {policy.metaPurchaseMinUsdt}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary">
            Сохранить комиссии
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Политика выводов</h3>
        <p className="muted">
          Пока ключ <code>withdraw_auto_approve</code> в БД пустой, используется переменная окружения{" "}
          <code>WITHDRAW_AUTO_APPROVE</code>. Сохранение ниже записывает явное 0/1 в БД и перекрывает env.
        </p>
        <form onSubmit={saveWithdrawPolicy}>
          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
            <input
              type="checkbox"
              checked={withdrawAutoApprove}
              onChange={(e) => setWithdrawAutoApprove(e.target.checked)}
            />
            Авто-подтверждение выводов (сразу в статус «отправлено», без ручного одобрения в админке)
          </label>
          <button type="submit" className="btn btn-primary">
            Сохранить политику авто-вывода
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Адреса и секреты (осторожно)</h3>
        <p className="muted">
          Поле mnemonic заполняйте только при смене; пустое поле не перезаписывает существующее значение в БД.
        </p>
        <form onSubmit={saveWallets}>
          <div className="row">
            <label>gaz_bank_tron</label>
            <input value={gazBankTron} onChange={(e) => setGazBankTron(e.target.value)} />
          </div>
          <div className="row">
            <label>topup_bank_tron</label>
            <input value={topupBankTron} onChange={(e) => setTopupBankTron(e.target.value)} />
          </div>
          <div className="row">
            <label>withdraw_wallet_tron</label>
            <input value={withdrawWalletTron} onChange={(e) => setWithdrawWalletTron(e.target.value)} />
          </div>
          <div className="row">
            <label>treasury_deposit_tron</label>
            <input value={treasuryDepositTron} onChange={(e) => setTreasuryDepositTron(e.target.value)} />
          </div>
          <div className="row">
            <label>deterministic_derive_key</label>
            <input value={deterministicDeriveKey} onChange={(e) => setDeterministicDeriveKey(e.target.value)} />
          </div>
          <div className="row">
            <label>hd_wallet_mnemonic (новое значение)</label>
            <input type="password" value={hdMnemonic} onChange={(e) => setHdMnemonic(e.target.value)} placeholder="оставьте пустым, чтобы не менять" />
          </div>
          <button type="submit" className="btn btn-primary">
            Сохранить кошельки
          </button>
        </form>
        <details style={{ marginTop: "1rem" }}>
          <summary className="muted" style={{ cursor: "pointer" }}>
            Показать app_config (часть ключей скрыта на API)
          </summary>
          <pre style={{ fontSize: 11, overflow: "auto", maxHeight: 240 }}>{JSON.stringify(appConfig, null, 2)}</pre>
        </details>
      </div>
    </>
  );
}
