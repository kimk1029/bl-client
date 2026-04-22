"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "detail" | "topbar";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  children: ReactNode;
  /** Render the active/on state (e.g. filled bookmark). */
  active?: boolean;
  /** Accessible label — required for icon-only buttons. */
  "aria-label": string;
}

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  // used on page-owned detail headers (post detail, message thread, cell, etc.)
  detail: "blessing-detail-icon-btn",
  // used on the global topbar
  topbar: "blessing-icon-btn",
};

/**
 * Round icon-only button for headers.
 *   <IconButton variant="detail" aria-label="뒤로가기"><IconBack/></IconButton>
 */
export function IconButton({
  variant = "detail",
  active,
  className,
  children,
  ...rest
}: IconButtonProps) {
  const base = VARIANT_CLASS[variant];
  const activeClass =
    active && variant === "detail" ? " blessing-detail-icon-btn-on" : "";
  const cls = `${base}${activeClass}${className ? ` ${className}` : ""}`.trim();
  return (
    <button type="button" {...rest} className={cls}>
      {children}
    </button>
  );
}
