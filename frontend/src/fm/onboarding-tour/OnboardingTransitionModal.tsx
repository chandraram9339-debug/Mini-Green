import { createPortal } from "react-dom";

import s from "./OnboardingTransitionModal.module.css";

const Z_INDEX = 100048;

export type OnboardingTransitionModalProps = {
  isOpen: boolean;
  title: string;
  startGuideLabel: string;
  skipLabel: string;
  onStartGuide: () => void;
  onSkip: () => void;
};

/**
 * Shown after Quick Tour: choice to run Getting Started or skip.
 */
export function OnboardingTransitionModal({
  isOpen,
  title,
  startGuideLabel,
  skipLabel,
  onStartGuide,
  onSkip,
}: OnboardingTransitionModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  const node = (
    <div
      className={s.root}
      style={{ zIndex: Z_INDEX }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-transition-title"
    >
      <button type="button" className={s.backdrop} aria-label={skipLabel} onClick={onSkip} />

      <div className={s.card}>
        <h2 id="onboarding-transition-title" className={s.title}>
          {title}
        </h2>
        <div className={s.actions}>
          <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={onStartGuide}>
            {startGuideLabel}
          </button>
          <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={onSkip}>
            {skipLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
