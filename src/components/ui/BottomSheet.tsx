"use client";

import { useEffect, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Accessible label for screen readers. */
  label?: string;
  children: ReactNode;
}

/**
 * Bottom-sheet modal with backdrop + handle + animated rise.
 * Used by UserMenu, Cell invite, etc.
 */
export function BottomSheet({ open, onClose, label, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="blessing-user-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
    >
      <div
        className="blessing-user-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="blessing-user-sheet-handle" aria-hidden />
        {children}
      </div>
    </div>
  );
}

export function BottomSheetHead({
  icon,
  title,
  subtitle,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="blessing-user-sheet-head">
      {icon && (
        <div
          className="blessing-mychurch-empty-icon"
          style={{ width: 44, height: 44, flexShrink: 0 }}
          aria-hidden
        >
          {icon}
        </div>
      )}
      <div className="blessing-user-sheet-head-info">
        <div className="blessing-user-sheet-name">{title}</div>
        {subtitle && <div className="blessing-user-sheet-sub">{subtitle}</div>}
      </div>
    </div>
  );
}
