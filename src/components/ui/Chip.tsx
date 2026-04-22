"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

interface CommonProps {
  active?: boolean;
  className?: string;
  children: ReactNode;
}

type ChipAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ChipAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

type ChipProps = ChipAsButton | ChipAsLink;

/**
 * Pill-shaped chip used for filters / topic tags.
 * Pass `active` to highlight it, `href` to make it a link.
 */
export function Chip(props: ChipProps) {
  const { active, className, children, ...rest } = props;
  const cls = `blessing-chip${active ? " blessing-chip-active" : ""}${className ? ` ${className}` : ""}`;

  if ("href" in rest && rest.href) {
    const { href, ...anchor } = rest;
    return (
      <Link href={href} className={cls} {...anchor}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

/** Horizontal scrollable chip container. Pass `wrap` for multi-line chip rows. */
export function ChipRow({
  children,
  wrap,
  className,
}: {
  children: ReactNode;
  wrap?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`blessing-chip-row${wrap ? " blessing-chip-row-wrap" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
