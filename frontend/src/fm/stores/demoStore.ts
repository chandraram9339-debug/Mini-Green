import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TradingJournalItem } from "../api/fetchTradingJournal";
import type { GraphicPoint } from "../figma/components/tradingChartPoints";

const STORAGE_KEY = "fm-paper-demo-v1";

export type DemoStoreState = {
  /** Режим отображения и локальной логики бота — без вызова боевого API переключения. */
  isDemoMode: boolean;
  /**
   * Сумма виртуальных пополнений демо (USDT). Баланс на экране = это × PnL% системного зеркала.
   * Поле `demoBalanceUsdt` синхронизируется с этим при пополнении (legacy persist).
   */
  demoTotalDepositedUsdt: number;
  demoBalanceUsdt: number;
  /** ISO — якорь графика «баланс», как positiveBalanceStartedAt кошелька */
  demoPositiveBalanceStartedAt: string | null;
  /** Кэш ответа `fetchTradingJournal(..., "system")` — обновляется с главной. */
  demoMirrorJournalRows: TradingJournalItem[];
  demoMirrorSystemChartPoints: GraphicPoint[];
  setDemoMode: (next: boolean) => void;
  setDemoMirrorTradingSnapshot: (rows: TradingJournalItem[], systemChart: GraphicPoint[]) => void;
  clearDemoMirrorTradingSnapshot: () => void;
  /** Пополнение демо; включает демо-режим и при необходимости ставит якорь даты. */
  creditDemoFunds: (amountUsdt: number) => void;
  /** Обнулить виртуальный депозит и якорь графика (режим Live/Demo не меняет). */
  resetDemoAccount: () => void;
};

export const useDemoStore = create<DemoStoreState>()(
  persist(
    (set) => ({
      isDemoMode: false,
      demoTotalDepositedUsdt: 0,
      demoBalanceUsdt: 0,
      demoPositiveBalanceStartedAt: null,
      demoMirrorJournalRows: [],
      demoMirrorSystemChartPoints: [],
      setDemoMode: (next) =>
        set((s) =>
          next
            ? { isDemoMode: true }
            : {
                isDemoMode: false,
                demoMirrorJournalRows: [],
                demoMirrorSystemChartPoints: [],
              },
        ),
      setDemoMirrorTradingSnapshot: (rows, systemChart) =>
        set({ demoMirrorJournalRows: rows, demoMirrorSystemChartPoints: systemChart }),
      clearDemoMirrorTradingSnapshot: () =>
        set({ demoMirrorJournalRows: [], demoMirrorSystemChartPoints: [] }),
      resetDemoAccount: () =>
        set({
          demoBalanceUsdt: 0,
          demoTotalDepositedUsdt: 0,
          demoPositiveBalanceStartedAt: null,
          demoMirrorJournalRows: [],
          demoMirrorSystemChartPoints: [],
        }),
      creditDemoFunds: (amountUsdt) => {
        const add = Math.max(0, amountUsdt);
        if (add <= 0) return;
        const nowIso = new Date().toISOString();
        set((s) => {
          const nextDep = s.demoTotalDepositedUsdt + add;
          return {
            demoTotalDepositedUsdt: nextDep,
            demoBalanceUsdt: nextDep,
            isDemoMode: true,
            demoPositiveBalanceStartedAt:
              s.demoPositiveBalanceStartedAt ?? (nextDep > 0 ? nowIso : null),
          };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persisted: unknown, fromVersion: number) => {
        const p = persisted as Partial<DemoStoreState> & { demoTotalDepositedUsdt?: number };
        if (fromVersion < 2) {
          const dep = typeof p.demoTotalDepositedUsdt === "number" ? p.demoTotalDepositedUsdt : 0;
          const legacy = typeof p.demoBalanceUsdt === "number" ? p.demoBalanceUsdt : 0;
          p.demoTotalDepositedUsdt = dep > 0 ? dep : legacy;
        }
        return p as DemoStoreState;
      },
      partialize: (s) => ({
        isDemoMode: s.isDemoMode,
        demoBalanceUsdt: s.demoBalanceUsdt,
        demoTotalDepositedUsdt: s.demoTotalDepositedUsdt,
        demoPositiveBalanceStartedAt: s.demoPositiveBalanceStartedAt,
      }),
    },
  ),
);
