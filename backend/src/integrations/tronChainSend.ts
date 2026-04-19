import { TronWeb } from "tronweb";
import type { AppConfig } from "../config.js";
import { isValidTronTrc20Address } from "../domain/deriveAddress.js";
import { logEvent } from "../httpEnvelope.js";
import { getTrc20UsdtBalanceReadonly } from "./tronUsdt.js";

const TRC20_MIN_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  }
] as const;

function tron(c: AppConfig, privateKeyHex: string) {
  const h = c.tronApiKey ? { "TRON-PRO-API-KEY": c.tronApiKey } : undefined;
  return new TronWeb({ fullHost: c.tronFullHost, privateKey: privateKeyHex, headers: h } as {
    fullHost: string;
    privateKey: string;
    headers?: Record<string, string>;
  });
}

function minorToUsdt6String(minor: number) {
  return (BigInt(Math.max(0, Math.floor(minor))) * 10_000n).toString();
}

/**
 * GAZ-bank: TRX to user (sun). Requires `LIVE_TRON_SEND` + `GAZ_BANK_PRIVATE_KEY` + valid Tron `to` address.
 */
export async function sendGasTrx(
  c: AppConfig,
  toBase58: string,
  amountSun: number,
  trace: string
) {
  if (!c.gazBankPrivateKey || c.gazBankPrivateKey.length < 64) {
    return { ok: false as const, error: "no_gas_key" as const };
  }
  if (!isValidTronTrc20Address(toBase58)) {
    return { ok: false as const, error: "bad_to" as const };
  }
  if (amountSun <= 0) {
    return { ok: false as const, error: "zero_amount" as const };
  }
  try {
    const tw = tron(c, c.gazBankPrivateKey);
    const r = (await tw.trx.sendTrx(toBase58, amountSun)) as {
      result?: boolean;
      txid?: string;
    };
    if (r?.result) {
      logEvent(trace, "chain.live.trx_gaz", { to: toBase58, sun: amountSun, txid: r.txid });
      return { ok: true as const, txid: r.txid as string | undefined };
    }
    logEvent(trace, "chain.live.trx_gaz_fail", { to: toBase58, r });
    return { ok: false as const, error: "broadcast" as const };
  } catch (e) {
    logEvent(trace, "chain.live.trx_gaz_ex", { err: String(e) });
    return { ok: false as const, error: "exception" as const };
  }
}

/**
 * TRC20 USDT: transfer from a wallet (private key) to `toBase58`. Amount in app “minor” (0.01 USDT).
 */
export async function sendUsdtTrc20(
  c: AppConfig,
  fromPrivateKeyHex: string,
  toBase58: string,
  amountMinor: number,
  trace: string
) {
  if (!isValidTronTrc20Address(toBase58) || !isValidTronTrc20Address(c.usdtTrc20)) {
    return { ok: false as const, error: "bad_address" as const };
  }
  if (amountMinor <= 0) {
    return { ok: false as const, error: "zero_amount" as const };
  }
  try {
    const tw = tron(c, fromPrivateKeyHex) as {
      contract: (abi: typeof TRC20_MIN_ABI, a: string) => { at(a: string): Promise<{ transfer: (t: string, b: string) => { send: (o: { feeLimit: number }) => Promise<{ txid?: string }> } }> };
    };
    const inst = await tw.contract(TRC20_MIN_ABI, c.usdtTrc20).at(c.usdtTrc20);
    const a6 = minorToUsdt6String(amountMinor);
    const out = await inst.transfer(toBase58, a6).send({ feeLimit: c.tronFeeLimitSun });
    const txid = (out as { txid?: string })?.txid;
    logEvent(trace, "chain.live.usdt_transfer", { to: toBase58, amount_minor: amountMinor, txid });
    return { ok: true as const, txid };
  } catch (e) {
    logEvent(trace, "chain.live.usdt_transfer_ex", { to: toBase58, err: String(e) });
    return { ok: false as const, error: "exception" as const };
  }
}

/**
 * `LIVE_TRON` chain deposit: send TRX to user, then sweep full on-chain USDT to topup (in minor).
 */
export async function runLiveDepositSends(
  c: AppConfig,
  topupTo: string,
  userDeposit: string,
  userPrivateKeyHex: string,
  trace: string
) {
  if (!c.liveTronSend) {
    return;
  }
  if (!c.gazBankPrivateKey) {
    logEvent(trace, "chain.live.deposit.no_gas_key", {});
    return;
  }
  if (!isValidTronTrc20Address(userDeposit) || !isValidTronTrc20Address(topupTo)) {
    logEvent(trace, "chain.live.deposit.skip_not_tron", { topupTo, userDeposit: userDeposit });
    return;
  }
  await sendGasTrx(c, userDeposit, c.gasTrxToUserSun, trace);
  const balMinor = await getTrc20UsdtBalanceReadonly(c, userDeposit);
  if (balMinor <= 0) {
    logEvent(trace, "chain.live.sweep.nothing", { userDeposit });
    return;
  }
  await sendUsdtTrc20(c, userPrivateKeyHex, topupTo, balMinor, trace);
}
