import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "fm-paper-demo-v1";

export type DemoStoreState = {
  /** Режим отображения и локальной логики бота — без вызова боевого API переключения. */
  isDemoMode: boolean;
  demoBalanceUsdt: number;
  /** ISO — якорь графика «баланс», как positiveBalanceStartedAt кошелька */
  demoPositiveBalanceStartedAt: string | null;
  setDemoMode: (next: boolean) => void;
  /** Пополнение демо; включает демо-режим и при необходимости ставит якорь даты. */
  creditDemoFunds: (amountUsdt: number) => void;
  /** Обнулить виртуальный баланс и якорь графика (режим Live/Demo не меняет). */
  resetDemoAccount: () => void;
};

export const useDemoStore = create<DemoStoreState>()(
  persist(
    (set) => ({
      isDemoMode: false,
      demoBalanceUsdt: 0,
      demoPositiveBalanceStartedAt: null,
      setDemoMode: (next) => set({ isDemoMode: next }),
      resetDemoAccount: () =>
        set({
          demoBalanceUsdt: 0,
          demoPositiveBalanceStartedAt: null,
        }),
      creditDemoFunds: (amountUsdt) => {
        const add = Math.max(0, amountUsdt);
        if (add <= 0) return;
        const nowIso = new Date().toISOString();
        set((s) => {
          const nextBal = s.demoBalanceUsdt + add;
          return {
            demoBalanceUsdt: nextBal,
            isDemoMode: true,
            demoPositiveBalanceStartedAt:
              s.demoPositiveBalanceStartedAt ?? (nextBal > 0 ? nowIso : null),
          };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        isDemoMode: s.isDemoMode,
        demoBalanceUsdt: s.demoBalanceUsdt,
        demoPositiveBalanceStartedAt: s.demoPositiveBalanceStartedAt,
      }),
    },
  ),
);
