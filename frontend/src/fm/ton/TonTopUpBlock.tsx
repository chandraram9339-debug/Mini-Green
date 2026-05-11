import { useFmLocale } from "../i18n/useFmLocale";
import { useTonTopUpFlow } from "./useTonTopUpFlow";
import { showMiniAppAlert } from "../telegram/uiFeedback";
import { hapticError, hapticLight, hapticSuccess } from "../telegram/uiFeedback";

export type TonTopUpBlockProps = {
  wrapClassName?: string;
  buttonClassName?: string;
  /** Если заданы — первая/вторая кнопка со своими стилями (иначе обе через `buttonClassName`). */
  primaryButtonClassName?: string;
  secondaryButtonClassName?: string;
  tonCentralAddress?: string | null;
  jettonMaster?: string | null;
  /** Telegram numeric id as string (comment / memo). */
  tgComment: string;
  /** Demo mode: still allows real on-chain send; shows extra hint once. */
  demoHint?: boolean;
};

/**
 * TON Connect actions: native TON + optional USDT jetton transfer to the app's central treasury.
 */
export function TonTopUpBlock({
  wrapClassName,
  buttonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  tonCentralAddress,
  jettonMaster,
  tgComment,
  demoHint,
}: TonTopUpBlockProps) {
  const { t } = useFmLocale();
  const { busy, sendTonWithComment, sendJettonUsdtWithComment, runWithBusy, walletAddress, openConnect } =
    useTonTopUpFlow();

  const central = tonCentralAddress?.trim() ?? "";
  const master = jettonMaster?.trim() ?? "";
  const disabled = !central || busy;
  const btnPrimary = primaryButtonClassName ?? buttonClassName;
  const btnSecondary = secondaryButtonClassName ?? buttonClassName;

  async function onTon(): Promise<void> {
    if (!central) {
      showMiniAppAlert(t("topup.tonNotConfigured"), { force: true });
      return;
    }
    if (!tgComment || tgComment === "0") {
      showMiniAppAlert(t("topup.tonNoTgId"), { force: true });
      return;
    }
    try {
      await runWithBusy(async () => {
        await sendTonWithComment(central, tgComment);
      });
      hapticSuccess();
      showMiniAppAlert(t("topup.tonSentPending"), { force: true });
    } catch (e) {
      hapticError();
      const msg = e instanceof Error ? e.message : String(e);
      if (/reject|cancel|decline/i.test(msg)) {
        showMiniAppAlert(t("topup.tonCancelled"), { force: true });
        return;
      }
      showMiniAppAlert(t("topup.tonFailed", { message: msg }), { force: true });
    }
  }

  async function onJetton(): Promise<void> {
    if (!central || !master) {
      showMiniAppAlert(t("topup.tonJettonNotConfigured"), { force: true });
      return;
    }
    const userAddr = walletAddress?.trim();
    if (!userAddr) {
      hapticLight();
      openConnect();
      showMiniAppAlert(t("topup.tonConnectFirst"), { force: true });
      return;
    }
    if (!tgComment || tgComment === "0") {
      showMiniAppAlert(t("topup.tonNoTgId"), { force: true });
      return;
    }
    try {
      await runWithBusy(async () => {
        await sendJettonUsdtWithComment(central, userAddr, master, tgComment);
      });
      hapticSuccess();
      showMiniAppAlert(t("topup.tonSentPending"), { force: true });
    } catch (e) {
      hapticError();
      const msg = e instanceof Error ? e.message : String(e);
      if (/reject|cancel|decline/i.test(msg)) {
        showMiniAppAlert(t("topup.tonCancelled"), { force: true });
        return;
      }
      showMiniAppAlert(t("topup.tonFailed", { message: msg }), { force: true });
    }
  }

  return (
    <div className={wrapClassName}>
      {demoHint ? (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", lineHeight: 1.4 }}>{t("topup.tonDemoHint")}</p>
      ) : null}
      <button type="button" className={btnPrimary} disabled={disabled} onClick={() => void onTon()}>
        {t("topup.tonWalletPrimary")}
      </button>
      <button type="button" className={btnSecondary} style={{ marginTop: 10 }} disabled={disabled || !master} onClick={() => void onJetton()}>
        {t("topup.tonWalletJetton")}
      </button>
    </div>
  );
}
