import type { HTMLAttributes } from "react";

import s from "./LoadingSpinner.module.css";

export type LoadingSpinnerTone = "dark" | "light";

export type LoadingSpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Dark surfaces (default) vs light/green-tinted backgrounds */
  tone?: LoadingSpinnerTone;
  /** Accessible name; defaults to "Loading" */
  label?: string;
};

export function LoadingSpinner({
  className,
  tone = "dark",
  label = "Loading",
  ...rest
}: LoadingSpinnerProps) {
  return (
    <span
      {...rest}
      className={`${s.root} ${tone === "light" ? s.toneLight : s.toneDark}${className ? ` ${className}` : ""}`}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <span className={s.ring} aria-hidden />
    </span>
  );
}
