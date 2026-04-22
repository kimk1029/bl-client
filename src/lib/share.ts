"use client";

import { toast } from "sonner";

interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

function absoluteUrl(url: string): string {
  if (typeof window === "undefined") return url;
  if (/^https?:/i.test(url)) return url;
  return new URL(url, window.location.origin).toString();
}

export async function shareOrCopy(options: ShareOptions): Promise<void> {
  const url = absoluteUrl(options.url);
  const nav =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { share?: (d: ShareData) => Promise<void> })
      : null;

  if (nav?.share) {
    try {
      await nav.share({ title: options.title, text: options.text, url });
      return;
    } catch (err) {
      // User canceled or share failed — silently fall back to clipboard only for non-abort errors.
      if ((err as DOMException)?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success("링크가 복사되었어요.");
  } catch {
    toast.error("공유에 실패했어요. 링크를 직접 복사해 주세요.");
  }
}
