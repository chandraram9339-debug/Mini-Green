import { createPortal } from "react-dom";

import s from "./OnboardingTransitionModal.module.css";

const Z_INDEX = 100049;

export type GettingStartedCompletionModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  startBotLabel: string;
  gotItLabel: string;
  onStartBot: () => void;
  onGotIt: () => void;
};

/**
 * Shown after the last Getting Started tour step — success state before marking onboarding complete.
 */
export function GettingStartedCompletionModal({
  isOpen,
  title,
  description,
  startBotLabel,
  gotItLabel,
  onStartBot,
  onGotIt,
}: GettingStartedCompletionModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  const node = (
    <div
      className={s.root}
      style={{ zIndex: Z_INDEX }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-gs-completion-title"
      aria-describedby="onboarding-gs-completion-desc"
    >
      <button type="button" className={s.backdrop} aria-label={gotItLabel} onClick={onGotIt} />

      <div className={s.card}>
        <h2 id="onboarding-gs-completion-title" className={s.title}>
          {title}
        </h2>
        <p id="onboarding-gs-completion-desc" className={s.completionDesc}>
          {description}
        </p>
        <div className={s.actions}>
          <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={onStartBot}>
            {startBotLabel}
          </button>
          <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={onGotIt}>
            {gotItLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
