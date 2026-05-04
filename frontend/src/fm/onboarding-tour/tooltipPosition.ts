import type { TourTooltipPlacement } from "./types";

/** Gap between highlight and tooltip (px). */
export const TOOLTIP_GAP = 14;

/** Minimum margin from visual viewport edges (px). */
export const VIEW_MARGIN = 16;

export type ViewportRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Visible viewport for clamping (Telegram Mini App / mobile browsers).
 * Prefer `visualViewport`; fallback to layout viewport.
 */
export function readVisualViewportRect(): ViewportRect {
  if (typeof window === "undefined") {
    return { left: 0, top: 0, width: 1024, height: 768 };
  }
  const vv = window.visualViewport;
  if (vv && vv.width > 0 && vv.height > 0) {
    return {
      left: vv.offsetLeft,
      top: vv.offsetTop,
      width: vv.width,
      height: vv.height,
    };
  }
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

export type TooltipSize = { width: number; height: number };

/**
 * Compute safe `top` / `left` in **viewport** coordinates (same as `getBoundingClientRect`).
 */
export function calculateTooltipPosition(
  targetRect: DOMRect,
  tooltipSize: TooltipSize,
  viewport: ViewportRect,
  placement: TourTooltipPlacement,
  gap: number = TOOLTIP_GAP,
  margin: number = VIEW_MARGIN,
): { top: number; left: number } {
  const { width: tw, height: th } = tooltipSize;
  const vl = viewport.left;
  const vt = viewport.top;
  const vw = viewport.width;
  const vh = viewport.height;
  const tr = targetRect;

  const fitsBelow = tr.bottom + gap + th <= vt + vh - margin;
  const fitsAbove = tr.top - gap - th >= vt + margin;

  let left: number;
  let top: number;

  if (placement === "center") {
    left = vl + (vw - tw) / 2;
    top = vt + (vh - th) / 2;
    left = clamp(left, vl + margin, vl + vw - tw - margin);
    top = clamp(top, vt + margin, vt + vh - th - margin);
    return { top, left };
  }

  if (placement === "left") {
    left = tr.left - gap - tw;
    if (left < vl + margin) {
      left = tr.right + gap;
    }
    left = clamp(left, vl + margin, vl + vw - tw - margin);
    top = tr.top + tr.height / 2 - th / 2;
    top = clamp(top, vt + margin, vt + vh - th - margin);
    return { top, left };
  }

  if (placement === "right") {
    left = tr.right + gap;
    if (left + tw > vl + vw - margin) {
      left = tr.left - gap - tw;
    }
    left = clamp(left, vl + margin, vl + vw - tw - margin);
    top = tr.top + tr.height / 2 - th / 2;
    top = clamp(top, vt + margin, vt + vh - th - margin);
    return { top, left };
  }

  // Prefer anchoring to target center, then clamp horizontally (never clip left/right).
  const targetCenterX = tr.left + tr.width / 2;
  left = targetCenterX - tw / 2;
  left = clamp(left, vl + margin, vl + vw - tw - margin);

  if (placement === "bottom") {
    if (fitsBelow) {
      top = tr.bottom + gap;
    } else if (fitsAbove) {
      top = tr.top - gap - th;
    } else {
      top = vt + (vh - th) / 2;
      top = clamp(top, vt + margin, vt + vh - th - margin);
    }
  } else if (placement === "top") {
    if (fitsAbove) {
      top = tr.top - gap - th;
    } else if (fitsBelow) {
      top = tr.bottom + gap;
    } else {
      top = vt + (vh - th) / 2;
      top = clamp(top, vt + margin, vt + vh - th - margin);
    }
  } else {
    top = tr.top + tr.height / 2 - th / 2;
    top = clamp(top, vt + margin, vt + vh - th - margin);
  }

  return { top, left };
}

export function calculateTooltipPositionCentered(
  tooltipSize: TooltipSize,
  viewport: ViewportRect,
  margin: number = VIEW_MARGIN,
): { top: number; left: number } {
  const vl = viewport.left;
  const vt = viewport.top;
  const vw = viewport.width;
  const vh = viewport.height;
  const { width: tw, height: th } = tooltipSize;
  let left = vl + (vw - tw) / 2;
  let top = vt + (vh - th) / 2;
  left = clamp(left, vl + margin, vl + vw - tw - margin);
  top = clamp(top, vt + margin, vt + vh - th - margin);
  return { top, left };
}

function clamp(n: number, min: number, max: number): number {
  if (max <= min) return min;
  return Math.max(min, Math.min(n, max));
}

/**
 * Convert viewport coordinates to `position:absolute` offsets inside the tour root
 * (padding box origin — same as `getBoundingClientRect` + `clientLeft` / `clientTop`).
 */
export function viewportPointToRootLocal(
  rootEl: HTMLDivElement,
  viewportX: number,
  viewportY: number,
): { left: number; top: number } {
  const rect = rootEl.getBoundingClientRect();
  const originX = rect.left + rootEl.clientLeft;
  const originY = rect.top + rootEl.clientTop;
  return {
    left: viewportX - originX,
    top: viewportY - originY,
  };
}
