import type { ReactNode } from "react";

export type BadgeVariant =
  | "pin"
  | "hot"
  | "accent"
  | "me"
  | "op"
  | "meetupOpen"
  | "meetupFull"
  | "cellNext";

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  pin: "blessing-post-badge blessing-badge-pin",
  hot: "blessing-post-badge blessing-badge-hot",
  accent: "blessing-post-badge",
  me: "blessing-me-badge",
  op: "blessing-comment-op",
  meetupOpen: "blessing-meetup-open-badge",
  meetupFull: "blessing-meetup-full-badge",
  cellNext: "blessing-cell-mtg-next-badge",
};

export function Badge({
  variant,
  children,
  className,
}: {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`${VARIANT_CLASS[variant]}${className ? ` ${className}` : ""}`}
    >
      {children}
    </span>
  );
}
