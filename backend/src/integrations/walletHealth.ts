import type { Database } from "better-sqlite3";
import { TronWeb } from "tronweb";
import type { AppConfig } from "../config.js";
import { isValidTronTrc20Address } from "../domain/deriveAddress.js";
import { resolveChainLabels } from "../domain/effectiveConfig.js";
import { getTrc20UsdtBalanceReadonly } from "./tronUsdt.js";

export type WalletHealthEntry = {
  key: "gas_bank" | "withdraw_wallet";
  label: string;
  address: string | null;
  address_source: "app_config" | "private_key" | "unresolved";
  trx_balance_sun: number | null;
  trx_balance_trx: number | null;
  usdt_balance_minor: number | null;
  usdt_balance_usdt: number | null;
  ok: boolean;
  alerts: string[];
};

export type WalletHealthReport = {
  live_tron_send: boolean;
  checked_at: string;
  gas_bank: WalletHealthEntry;
  withdraw_wallet: WalletHealthEntry;
  alerts: string[];
};

export type WithdrawWalletCapacityResult =
  | {
      ok: true;
      address: string;
      trx_balance_sun: number;
      usdt_balance_minor: number;
    }
  | {
      ok: false;
      reason:
        | "withdraw_wallet_not_configured"
        | "wallet_balance_check_failed"
        | "withdraw_wallet_low_trx"
        | "withdraw_wallet_low_usdt";
      message: string;
      address: string | null;
      trx_balance_sun: number | null;
      usdt_balance_minor: number | null;
    };

function tronReadonly(c: AppConfig) {
  const h = c.tronApiKey ? { "TRON-PRO-API-KEY": c.tronApiKey } : undefined;
  return new TronWeb({ fullHost: c.tronFullHost, headers: h } as {
    fullHost: string;
    headers?: Record<string, string>;
  });
}

function sunToTrx(sun: number | null): number | null {
  if (sun == null || !Number.isFinite(sun)) return null;
  return Number((sun / 1_000_000).toFixed(6));
}

function resolveWalletAddress(labelValue: string, privateKeyHex: string): {
  address: string | null;
  source: WalletHealthEntry["address_source"];
} {
  const trimmed = String(labelValue ?? "").trim();
  if (isValidTronTrc20Address(trimmed)) {
    return { address: trimmed, source: "app_config" };
  }
  const pk = String(privateKeyHex ?? "").replace(/^0x/i, "").trim();
  if (pk.length === 64) {
    try {
      const derived = TronWeb.address.fromPrivateKey(pk);
      return { address: typeof derived === "string" && derived ? derived : null, source: "private_key" };
    } catch {
      /* fall through */
    }
  }
  return { address: null, source: "unresolved" };
}

async function getTrxBalanceSunReadonly(c: AppConfig, address: string | null): Promise<number | null> {
  if (!address || !isValidTronTrc20Address(address)) return null;
  try {
    const tw = tronReadonly(c) as {
      trx: { getBalance: (address: string) => Promise<number | string> };
    };
    const raw = await tw.trx.getBalance(address);
    const n = Number(raw);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null;
  } catch {
    return null;
  }
}

function buildGasBankAlerts(trxBalanceSun: number | null, reserveSun: number): string[] {
  if (trxBalanceSun == null) return ["Не удалось прочитать баланс TRX газового кошелька."];
  if (trxBalanceSun <= 0) return ["На TRX-кошельке газа закончились средства."];
  if (trxBalanceSun < reserveSun) {
    return [`На TRX-кошельке газа мало средств: меньше ${sunToTrx(reserveSun)} TRX.`];
  }
  return [];
}

function buildWithdrawWalletAlerts(
  trxBalanceSun: number | null,
  usdtBalanceMinor: number | null,
  trxReserveSun: number,
  minWithdrawMinor: number
): string[] {
  const alerts: string[] = [];
  if (trxBalanceSun == null) {
    alerts.push("Не удалось прочитать TRX-баланс кошелька вывода.");
  } else if (trxBalanceSun <= 0) {
    alerts.push("На кошельке вывода закончился TRX для оплаты сети.");
  } else if (trxBalanceSun < trxReserveSun) {
    alerts.push(`На кошельке вывода мало TRX: меньше ${sunToTrx(trxReserveSun)} TRX.`);
  }

  if (usdtBalanceMinor == null) {
    alerts.push("Не удалось прочитать USDT-баланс кошелька вывода.");
  } else if (usdtBalanceMinor <= 0) {
    alerts.push("На кошельке вывода нет USDT.");
  } else if (usdtBalanceMinor < minWithdrawMinor) {
    alerts.push(`На кошельке вывода мало USDT: меньше ${(minWithdrawMinor / 100).toFixed(2)} USDT.`);
  }
  return alerts;
}

export async function getWalletHealthReport(db: Database, c: AppConfig): Promise<WalletHealthReport> {
  const labels = resolveChainLabels(c, db);
  const gasBankResolved = resolveWalletAddress(labels.gazBank, c.gazBankPrivateKey);
  const withdrawResolved = resolveWalletAddress(labels.withdrawWallet, c.withdrawWalletPrivateKey);

  const [gasBankTrx, withdrawTrx, withdrawUsdt] = await Promise.all([
    getTrxBalanceSunReadonly(c, gasBankResolved.address),
    getTrxBalanceSunReadonly(c, withdrawResolved.address),
    withdrawResolved.address ? getTrc20UsdtBalanceReadonly(c, withdrawResolved.address) : Promise.resolve(null),
  ]);

  const gasBankAlerts = buildGasBankAlerts(gasBankTrx, c.gasTrxToUserSun);
  const withdrawAlerts = buildWithdrawWalletAlerts(
    withdrawTrx,
    withdrawUsdt,
    c.tronFeeLimitSun,
    c.minWithdrawMinor
  );

  const gas_bank: WalletHealthEntry = {
    key: "gas_bank",
    label: labels.gazBank,
    address: gasBankResolved.address,
    address_source: gasBankResolved.source,
    trx_balance_sun: gasBankTrx,
    trx_balance_trx: sunToTrx(gasBankTrx),
    usdt_balance_minor: null,
    usdt_balance_usdt: null,
    ok: gasBankAlerts.length === 0,
    alerts: gasBankResolved.address ? gasBankAlerts : ["Не удалось определить адрес TRX-кошелька газа."],
  };

  const withdraw_wallet: WalletHealthEntry = {
    key: "withdraw_wallet",
    label: labels.withdrawWallet,
    address: withdrawResolved.address,
    address_source: withdrawResolved.source,
    trx_balance_sun: withdrawTrx,
    trx_balance_trx: sunToTrx(withdrawTrx),
    usdt_balance_minor: withdrawUsdt,
    usdt_balance_usdt: withdrawUsdt == null ? null : Number((withdrawUsdt / 100).toFixed(2)),
    ok: withdrawAlerts.length === 0,
    alerts: withdrawResolved.address ? withdrawAlerts : ["Не удалось определить адрес кошелька вывода."],
  };

  return {
    live_tron_send: c.liveTronSend,
    checked_at: new Date().toISOString(),
    gas_bank,
    withdraw_wallet,
    alerts: [...gas_bank.alerts, ...withdraw_wallet.alerts],
  };
}

export async function checkWithdrawWalletCapacity(
  db: Database,
  c: AppConfig,
  requiredUsdtMinor: number
): Promise<WithdrawWalletCapacityResult> {
  if (!c.liveTronSend || !c.withdrawWalletPrivateKey) {
    return {
      ok: true,
      address: "",
      trx_balance_sun: 0,
      usdt_balance_minor: 0,
    };
  }

  const labels = resolveChainLabels(c, db);
  const resolved = resolveWalletAddress(labels.withdrawWallet, c.withdrawWalletPrivateKey);
  if (!resolved.address) {
    return {
      ok: false,
      reason: "withdraw_wallet_not_configured",
      message: "Withdrawal is temporarily unavailable. Please try again later.",
      address: null,
      trx_balance_sun: null,
      usdt_balance_minor: null,
    };
  }

  const [trxBalanceSun, usdtBalanceMinor] = await Promise.all([
    getTrxBalanceSunReadonly(c, resolved.address),
    getTrc20UsdtBalanceReadonly(c, resolved.address),
  ]);

  if (trxBalanceSun == null || usdtBalanceMinor == null) {
    return {
      ok: false,
      reason: "wallet_balance_check_failed",
      message: "Withdrawal is temporarily unavailable. Please try again later.",
      address: resolved.address,
      trx_balance_sun: trxBalanceSun,
      usdt_balance_minor: usdtBalanceMinor,
    };
  }
  if (trxBalanceSun < c.tronFeeLimitSun) {
    return {
      ok: false,
      reason: "withdraw_wallet_low_trx",
      message: "Withdrawal is temporarily unavailable. Please try again later.",
      address: resolved.address,
      trx_balance_sun: trxBalanceSun,
      usdt_balance_minor: usdtBalanceMinor,
    };
  }
  if (usdtBalanceMinor < requiredUsdtMinor) {
    return {
      ok: false,
      reason: "withdraw_wallet_low_usdt",
      message: "Withdrawal is temporarily unavailable. Please try again later.",
      address: resolved.address,
      trx_balance_sun: trxBalanceSun,
      usdt_balance_minor: usdtBalanceMinor,
    };
  }
  return {
    ok: true,
    address: resolved.address,
    trx_balance_sun: trxBalanceSun,
    usdt_balance_minor: usdtBalanceMinor,
  };
}
