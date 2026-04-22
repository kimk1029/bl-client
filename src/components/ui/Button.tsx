"use client";

import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "submit"
  | "ghost";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "blessing-btn-primary",
  secondary: "blessing-btn-secondary",
  danger: "blessing-btn-danger",
  submit: "blessing-submit-btn",
  ghost: "blessing-btn-ghost",
};

interface CommonProps {
  variant?: ButtonVariant;
  active?: boolean;
  children?: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

type ButtonProps = ButtonAsButton | ButtonAsLink;

function resolveClass(variant: ButtonVariant, active?: boolean, extra?: string) {
  const base = VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary;
  const activeClass =
    active && variant === "primary"
      ? " blessing-btn-primary-on"
      : active && variant === "secondary"
        ? " blessing-btn-secondary-on"
        : "";
  return `${base}${activeClass}${extra ? ` ${extra}` : ""}`.trim();
}

/**
 * Unified button primitive.
 * - variant="primary" → accent solid
 * - variant="secondary" → bg-2 border
 * - variant="danger" → hot
 * - variant="submit" → compact accent pill (header submit)
 * - variant="ghost" → text only
 * Pass `href` to render as a Next.js Link instead of a <button>.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", active, className, children, ...rest } = props;
  const cls = resolveClass(variant, active, className);

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
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
