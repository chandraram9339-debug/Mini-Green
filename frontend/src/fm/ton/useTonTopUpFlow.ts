import { useCallback, useState } from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { toNano } from "@ton/core";
import { apiFetch } from "../api/http";
import { jettonTransferBodyB64, tonNativeCommentPayloadB64 } from "./tonPayload";

const DEFAULT_TON_SEND = "0.05";
/** Fixed demo jetton size (user can adjust in wallet UI). */
const DEFAULT_JETTON_USDT = 10;

export function useTonTopUpFlow() {
  const [tonConnectUI] = useTonConnectUI();
  const tonWallet = useTonWallet();
  const [busy, setBusy] = useState(false);

  const walletAddress = tonWallet?.account?.address ?? null;

  const sendTonWithComment = useCallback(
    async (centralAddress: string, tgUserIdComment: string) => {
      const validUntil = Math.floor(Date.now() / 1000) + 600;
      await tonConnectUI.sendTransaction({
        validUntil,
        messages: [
          {
            address: centralAddress,
            amount: toNano(DEFAULT_TON_SEND).toString(),
            payload: tonNativeCommentPayloadB64(tgUserIdComment),
          },
        ],
      });
    },
    [tonConnectUI]
  );

  const sendJettonUsdtWithComment = useCallback(
    async (
      centralAddress: string,
      userTonAddress: string,
      jettonMaster: string,
      tgUserIdComment: string,
      usdtAmount: number = DEFAULT_JETTON_USDT
    ) => {
      const q = new URLSearchParams({
        owner: userTonAddress,
        jetton_master: jettonMaster,
      });
      const res = await apiFetch(`/wallet/ton/jetton-wallet?${q.toString()}`);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "jetton_wallet_resolve_failed");
      }
      const j = (await res.json()) as { wallet_address?: string };
      const jw = j.wallet_address?.trim();
      if (!jw) throw new Error("jetton_wallet_missing");

      const jettonAmount = BigInt(Math.round(Math.max(0.000001, usdtAmount) * 1e6));
      const payload = jettonTransferBodyB64({
        jettonAmount,
        destinationFriendly: centralAddress,
        responseDestinationFriendly: userTonAddress,
        forwardTonAmount: toNano("0.05"),
        comment: tgUserIdComment,
      });

      const validUntil = Math.floor(Date.now() / 1000) + 600;
      await tonConnectUI.sendTransaction({
        validUntil,
        messages: [
          {
            address: jw,
            amount: toNano("0.2").toString(),
            payload,
          },
        ],
      });
    },
    [tonConnectUI]
  );

  const runWithBusy = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      try {
        await fn();
      } finally {
        setBusy(false);
      }
    },
    []
  );

  return {
    busy,
    openConnect: () => tonConnectUI.openModal(),
    sendTonWithComment,
    sendJettonUsdtWithComment,
    runWithBusy,
    connected: !!tonWallet,
    walletAddress,
  };
}
