"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  /** Override the default router.back() behavior. */
  onBack?: () => void;
  /** Right-side actions (icon buttons, etc.). */
  actions?: ReactNode;
}

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Shared page-owned header used by detail/list screens that opt out of the
 * global Header (posts detail, messages, cell, verify-church, etc.).
 */
export function DetailHeader({ title, subtitle, onBack, actions }: DetailHeaderProps) {
  const router = useRouter();
  return (
    <header className="blessing-detail-topbar">
      <button
        type="button"
        className="blessing-detail-icon-btn"
        onClick={onBack ?? (() => router.back())}
        aria-label="뒤로가기"
      >
        <IconBack />
      </button>
      <div className="blessing-detail-topbar-title-wrap">
        <div className="blessing-dm-title">{title}</div>
        {subtitle && <div className="blessing-dm-subtitle">{subtitle}</div>}
      </div>
      <div className="blessing-detail-topbar-actions">
        {actions ?? <span style={{ width: 36 }} aria-hidden />}
      </div>
    </header>
  );
}
