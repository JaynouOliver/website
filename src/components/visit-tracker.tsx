"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Pings /api/track on every page view. No-op until the Redis store is attached.
export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/analytics")) return; // don't log your own dashboard visits
    fetch("/api/track?p=" + encodeURIComponent(pathname)).catch(() => {});
  }, [pathname]);
  return null;
}
