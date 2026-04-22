"use client";

import { useState, type ReactNode } from "react";
import UserMenu from "./UserMenu";

interface UserLinkProps {
  userId: number | null | undefined;
  username: string;
  affiliation?: string | null;
  children?: ReactNode;
  className?: string;
  // If true, show a non-interactive span (for anonymous/self-author missing ids).
  disabled?: boolean;
}

/**
 * Inline trigger that opens the UserMenu sheet. Wrap any author name/avatar
 * with this to make it tappable.
 */
export default function UserLink({
  userId,
  username,
  affiliation,
  children,
  className,
  disabled,
}: UserLinkProps) {
  const [open, setOpen] = useState(false);
  const content = children ?? username;

  if (disabled || !userId || !Number.isFinite(userId)) {
    return <span className={className}>{content}</span>;
  }

  return (
    <>
      <button
        type="button"
        className={className ? `${className} blessing-user-link` : "blessing-user-link"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {content}
      </button>
      <UserMenu
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        username={username}
        affiliation={affiliation}
      />
    </>
  );
}
