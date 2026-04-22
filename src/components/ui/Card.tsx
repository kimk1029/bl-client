import type { HTMLAttributes, ReactNode } from "react";

export type CardVariant = "settings" | "meetup" | "event" | "plain";

const VARIANT_CLASS: Record<CardVariant, string> = {
  settings: "blessing-settings-card",
  meetup: "blessing-meetup-card",
  event: "blessing-event-card",
  plain: "",
};

export function Card({
  variant = "plain",
  className,
  children,
  ...rest
}: {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const base = VARIANT_CLASS[variant];
  return (
    <div
      className={`${base}${className ? ` ${className}` : ""}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardGroupLabel({ children }: { children: ReactNode }) {
  return <div className="blessing-settings-group-label">{children}</div>;
}

export function CardField({
  label,
  children,
  last,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="blessing-reg-field"
      style={last ? { borderBottom: "none" } : undefined}
    >
      <label className="blessing-reg-label">{label}</label>
      {children}
    </div>
  );
}
