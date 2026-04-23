"use client";

import { usePathname } from "next/navigation";
import GoogleAd from "./GoogleAd";

/**
 * Pages where the mobile bottom ad should NOT render — typically
 * task-focused flows, private conversations, and screens that already
 * own a bottom-fixed composer (post detail, message thread, cell).
 */
function shouldShowMobileAd(pathname: string): boolean {
  if (/^\/posts\/\d+(\/|$)/.test(pathname)) return false; // post detail (composer)
  if (pathname === "/posts/new") return false;
  if (/^\/messages\/(\d+|new)(\/|$)/.test(pathname)) return false;
  if (pathname.startsWith("/settings/")) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/auth")) return false;
  if (pathname === "/cell") return false;
  if (pathname === "/verify-church") return false;
  if (pathname === "/profile/edit") return false;
  if (pathname === "/events/meetups/new") return false;
  return true;
}

export function useMobileAdVisible(): boolean {
  const pathname = usePathname();
  return shouldShowMobileAd(pathname ?? "");
}

export default function MobileBottomAd() {
  const visible = useMobileAdVisible();
  if (!visible) return null;
  return (
    <div className="blessing-mobile-ad" aria-label="광고">
      <GoogleAd slot="3333333333" className="w-full" minHeight={50} />
    </div>
  );
}
