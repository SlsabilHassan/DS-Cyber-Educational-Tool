"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

// Records a page_view whenever the route changes. Complements Vercel Web
// Analytics (which is anonymous/aggregate) with per-session research events.
export function RouteTracker() {
  const pathname = usePathname();
  useEffect(() => {
    track("page_view", { path: pathname });
  }, [pathname]);
  return null;
}
