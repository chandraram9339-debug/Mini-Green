import { FormEvent, useEffect, useState } from "react";
import { apiJson } from "../api";
import type { AdminConfigResponse, FeePolicy } from "../types";

/** Matches backend `domain/referralRule.ts`: all | comma-separated deposit ordinals */
const RULE_PRESETS: { value: string; label: string }[] = [
  { value: "all", label: "Все депозиты" },
  { value: "1", label: "Только 1-й депозит" },
  { value: "2", label: "Только 2-й депозит" },
  { value: "3", label: "Только 3-й депозит" },
  { value: "1,2", label: "1-й и 2-й" },
  { value: "1,3", label: "1-й и 3-й" },
  { value: "2,3", label: "2-й и 3-й" },
  { value: "1,2,3", label: "1-й, 2-й и 3-й" }
];

function matchPreset(rule: string): string {
  const t = rule.trim();
  const hit = RULE_PRESETS.find((p) => p.value === t);
  return hit ? hit.value : "__custom__";
}

export default function Referral() {
  const [policy, setPolicy] = useState<FeePolicy | null>(null);
  const [referralPercentBps, setReferralPercentBps] = useState("");
  const [referralDepositRule, setReferralDepositRule] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    apiJson<AdminConfigResponse>("/admin/config")
      .then((c) => {
        setPolicy(c.policy);
        setReferralPercentBps(String(c.policy.referralPercentBps));
        setReferralDepositRule(c.policy.referralDepositRule);
      })
      .catch((e: Error) => setErr(e.message));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const r = await apiJson<{ ok: boolean; current: FeePolicy }>("/admin/config", {
        method: "PATCH",
        body: JSON.stringify({
          referral_percent_bps: Number(referralPercentBps),
          referral_deposit_rule: referralDepositRule.trim()
        })
      });
      setPolicy(r.current);
      setMsg("Сохранено");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      <h2>Реферальная программа</h2>
      <p className="muted">
        Процент в базисных пунктах (100 bps = 1%). Правило начисления — значение из бэкенда (например правило по
        первому депозиту), см. доменную логику.
      </p>
      {err ? <div className="err">{err}</div> : null}
      {msg ? <div className="ok">{msg}</div> : null}

      <div className="card">
        <form onSubmit={save}>
          <div className="row">
            <label htmlFor="bps">referral_percent_bps</label>
            <input id="bps" type="number" value={referralPercentBps} onChange={(e) => setReferralPercentBps(e.target.value)} />
          </div>
          <div className="row">
            <label htmlFor="preset">Правило по номеру депозита</label>
            <select
              id="preset"
              value={matchPreset(referralDepositRule)}
              onChange={(e) => {
                const v = e.target.value;
                if (v !== "__custom__") setReferralDepositRule(v);
              }}
              style={{ maxWidth: 420 }}
            >
              {RULE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} ({p.value})
                </option>
              ))}
              <option value="__custom__">Своя строка…</option>
            </select>
          </div>
          <div className="row">
            <label htmlFor="rule">referral_deposit_rule (как в конфиге)</label>
            <input id="rule" type="text" value={referralDepositRule} onChange={(e) => setReferralDepositRule(e.target.value)} />
          </div>
          {policy ? (
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Текущий снимок: {policy.referralPercentBps} bps, правило «{policy.referralDepositRule}»
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary">
            Сохранить
          </button>
        </form>
      </div>
    </>
  );
}
