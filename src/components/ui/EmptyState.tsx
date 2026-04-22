import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message?: string;
  action?: ReactNode;
  /** Minimum height in px (so the state doesn't collapse inside small panels). */
  minHeight?: number;
  className?: string;
}

/**
 * Generic empty / zero-state box.
 * - Light version (`title + message + action`) → centered card
 * - Simple version (`message` only) → reuses `.blessing-event-detail-missing`
 */
export function EmptyState({
  icon,
  title,
  message,
  action,
  minHeight,
  className,
}: EmptyStateProps) {
  if (title || icon || action) {
    return (
      <div
        className={`blessing-mychurch-empty${className ? ` ${className}` : ""}`}
        style={minHeight != null ? { minHeight } : undefined}
      >
        {icon && (
          <div className="blessing-mychurch-empty-icon" aria-hidden>
            {icon}
          </div>
        )}
        {title && (
          <div className="blessing-mychurch-empty-title">{title}</div>
        )}
        {message && (
          <div className="blessing-mychurch-empty-msg">{message}</div>
        )}
        {action}
      </div>
    );
  }
  return (
    <div
      className={`blessing-event-detail-missing${className ? ` ${className}` : ""}`}
      style={{ minHeight: minHeight ?? 120 }}
    >
      <div>{message ?? "표시할 내용이 없어요."}</div>
    </div>
  );
}
