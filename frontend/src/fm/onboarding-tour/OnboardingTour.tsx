import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useFmLocale } from "../i18n/useFmLocale";
import type { MessageKey } from "../i18n/messages";

import type { OnboardingScreenId, OnboardingTourStep } from "./types";
import {
  calculateTooltipPosition,
  calculateTooltipPositionCentered,
  readVisualViewportRect,
  viewportPointToRootLocal,
} from "./tooltipPosition";

import s from "./OnboardingTour.module.css";

const SPOTLIGHT_PAD = 8;
const Z_INDEX = 100050;
/** Max tooltip width for first-pass vertical fit checks (before measure). */
const TOOLTIP_MAX_W_EST = 360;
const TOOLTIP_VW_PAD = 32;

const SCREEN_BADGE_KEY: Record<OnboardingScreenId, MessageKey> = {
  home: "tab.home",
  wallet: "tab.wallet",
  trading: "tab.bot",
};

function findTargetEl(targetId: string): Element | null {
  if (typeof document === "undefined") return null;
  const safe = targetId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return document.querySelector(`[data-tour-id="${safe}"]`);
}

function setTourCssVars(
  el: HTMLDivElement | null,
  partial: Record<string, string>,
): void {
  if (!el) return;
  for (const [k, v] of Object.entries(partial)) {
    el.style.setProperty(k, v);
  }
}

export type OnboardingTourProps = {
  steps: OnboardingTourStep[];
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  /** Starting step when `isOpen` becomes true (uncontrolled mode only) */
  initialStepIndex?: number;
  /** Controlled step index (used with {@link onControlledStepIndexChange}) */
  controlledStepIndex?: number;
  onControlledStepIndexChange?: (index: number) => void;
  /** Changes when the route changes — remeasure targets after navigation */
  routeKey?: string;
};

export function OnboardingTour({
  steps,
  isOpen,
  onClose,
  onFinish,
  initialStepIndex = 0,
  controlledStepIndex,
  onControlledStepIndexChange,
  routeKey,
}: OnboardingTourProps) {
  const { t } = useFmLocale();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [internalStepIndex, setInternalStepIndex] = useState(initialStepIndex);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [hasTarget, setHasTarget] = useState(false);
  const [tooltipSizeTick, setTooltipSizeTick] = useState(0);

  const isControlled =
    controlledStepIndex !== undefined && typeof onControlledStepIndexChange === "function";

  useEffect(() => {
    if (!isControlled && isOpen) {
      setInternalStepIndex(Math.min(Math.max(0, initialStepIndex), Math.max(0, steps.length - 1)));
    }
  }, [isControlled, isOpen, initialStepIndex, steps.length]);

  const rawIndex = isControlled ? (controlledStepIndex ?? 0) : internalStepIndex;
  const total = steps.length;
  const safeIndex = total === 0 ? 0 : Math.min(Math.max(0, rawIndex), total - 1);
  const activeStep = total === 0 ? undefined : steps[safeIndex];

  const setStepClamped = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(0, next), Math.max(0, total - 1));
      if (isControlled && onControlledStepIndexChange) {
        onControlledStepIndexChange(clamped);
      } else if (!isControlled) {
        setInternalStepIndex(clamped);
      }
    },
    [isControlled, onControlledStepIndexChange, total],
  );

  const updateGeometry = useCallback(() => {
    if (!isOpen || !activeStep) {
      setTargetRect(null);
      setHasTarget(false);
      return;
    }
    const el = findTargetEl(activeStep.targetId);
    if (!el || !(el instanceof HTMLElement)) {
      setTargetRect(null);
      setHasTarget(false);
      return;
    }
    try {
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
    } catch {
      /* ignore */
    }
    const r = el.getBoundingClientRect();
    setTargetRect(r);
    setHasTarget(true);
  }, [activeStep, isOpen, routeKey]);

  useLayoutEffect(() => {
    updateGeometry();
  }, [updateGeometry, safeIndex, routeKey]);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        updateGeometry();
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen, routeKey, activeStep?.targetId, updateGeometry]);

  useEffect(() => {
    if (!isOpen) return;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateGeometry();
          })
        : null;
    const onWin = () => {
      updateGeometry();
    };
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", onWin);
      vv.addEventListener("scroll", onWin);
    }
    const el = activeStep ? findTargetEl(activeStep.targetId) : null;
    if (ro && el) ro.observe(el as Element);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
      if (vv) {
        vv.removeEventListener("resize", onWin);
        vv.removeEventListener("scroll", onWin);
      }
      ro?.disconnect();
    };
  }, [activeStep, isOpen, routeKey, updateGeometry]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const tt = tooltipRef.current;
    if (!tt || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      setTooltipSizeTick((n) => n + 1);
    });
    ro.observe(tt);
    return () => ro.disconnect();
  }, [isOpen, safeIndex, hasTarget, activeStep?.targetId]);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || !isOpen) return;

    if (!hasTarget || !targetRect || !activeStep) {
      setTourCssVars(el, {
        "--ot-spotlight-top": "0px",
        "--ot-spotlight-left": "0px",
        "--ot-spotlight-w": "0px",
        "--ot-spotlight-h": "0px",
        "--ot-tooltip-top": "50%",
        "--ot-tooltip-left": "50%",
        "--ot-tooltip-translate": "translate(-50%, -50%)",
      });
      el.style.zIndex = String(Z_INDEX);

      const id = window.requestAnimationFrame(() => {
        const root = rootRef.current;
        const tt = tooltipRef.current;
        if (!root || !tt) return;
        const v = readVisualViewportRect();
        const r = tt.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        const { top, left } = calculateTooltipPositionCentered(
          { width: r.width, height: r.height },
          v,
        );
        const local = viewportPointToRootLocal(root, left, top);
        setTourCssVars(root, {
          "--ot-tooltip-top": `${local.top}px`,
          "--ot-tooltip-left": `${local.left}px`,
          "--ot-tooltip-translate": "translate(0, 0)",
        });
      });
      return () => window.cancelAnimationFrame(id);
    }

    const st = targetRect.top - SPOTLIGHT_PAD;
    const sl = targetRect.left - SPOTLIGHT_PAD;
    const sw = targetRect.width + SPOTLIGHT_PAD * 2;
    const sh = targetRect.height + SPOTLIGHT_PAD * 2;

    const viewport = readVisualViewportRect();
    const estW = Math.min(TOOLTIP_MAX_W_EST, Math.max(0, viewport.width - TOOLTIP_VW_PAD));
    const estH = Math.min(480, Math.max(120, viewport.height * 0.55));
    const estPos = calculateTooltipPosition(
      targetRect,
      { width: estW, height: estH },
      viewport,
      activeStep.placement,
    );
    const localEst = viewportPointToRootLocal(el, estPos.left, estPos.top);

    setTourCssVars(el, {
      "--ot-spotlight-top": `${Math.max(0, st)}px`,
      "--ot-spotlight-left": `${Math.max(0, sl)}px`,
      "--ot-spotlight-w": `${sw}px`,
      "--ot-spotlight-h": `${sh}px`,
      "--ot-tooltip-top": `${localEst.top}px`,
      "--ot-tooltip-left": `${localEst.left}px`,
      "--ot-tooltip-translate": "translate(0, 0)",
    });
    el.style.zIndex = String(Z_INDEX);

    const id = window.requestAnimationFrame(() => {
      const root = rootRef.current;
      const tt = tooltipRef.current;
      if (!root || !tt || !activeStep) return;
      const r = tt.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const v = readVisualViewportRect();
      const { top, left } = calculateTooltipPosition(
        targetRect,
        { width: r.width, height: r.height },
        v,
        activeStep.placement,
      );
      const local = viewportPointToRootLocal(root, left, top);
      setTourCssVars(root, {
        "--ot-tooltip-top": `${local.top}px`,
        "--ot-tooltip-left": `${local.left}px`,
        "--ot-tooltip-translate": "translate(0, 0)",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [activeStep, hasTarget, isOpen, targetRect, tooltipSizeTick]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || total === 0 || !activeStep) {
    return null;
  }

  const isFirst = safeIndex <= 0;
  const isLast = safeIndex >= total - 1;

  const handlePrimary = () => {
    if (isLast) {
      onFinish();
    } else {
      setStepClamped(safeIndex + 1);
    }
  };

  const handleBack = () => {
    setStepClamped(safeIndex - 1);
  };

  const node = (
    <div
      ref={rootRef}
      className={`${s.root} ${!hasTarget ? s.rootNoTarget : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={s.spotlight} aria-hidden />

      <button type="button" className={s.skip} onClick={onClose}>
        {t("onboarding.tour.skip")}
      </button>

      <div ref={tooltipRef} className={s.tooltip}>
        <span className={s.screenBadge}>{t(SCREEN_BADGE_KEY[activeStep.screen])}</span>
        <h2 id={titleId} className={s.title}>
          {t(activeStep.titleKey)}
        </h2>
        <p className={s.description}>{t(activeStep.descriptionKey)}</p>
        {!hasTarget ? (
          <p className={s.hintMissing}>
            {t("onboarding.tour.missingTarget", { targetId: activeStep.targetId })}
          </p>
        ) : null}

        <div className={s.footer}>
          <span className={s.progress}>
            {safeIndex + 1} / {total}
          </span>
          <div className={s.actions}>
            <button
              type="button"
              className={`${s.btn} ${s.btnGhost}`}
              onClick={handleBack}
              disabled={isFirst}
            >
              {t("onboarding.tour.back")}
            </button>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={handlePrimary}>
              {isLast ? t("onboarding.tour.done") : t("onboarding.tour.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
