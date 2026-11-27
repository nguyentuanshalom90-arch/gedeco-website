"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function CmsOverlayLoader() {
  const searchParams = useSearchParams();
  const isCmsPreview = searchParams.get("cmsPreview") === "1";

  useEffect(() => {
    if (!isCmsPreview) return;
    if (typeof window === "undefined") return;

    if (!document.querySelector('script[src*="cms-overlay.js"]')) {
      const script = document.createElement("script");
      script.src = `/cms-overlay.js?v=${Date.now()}`;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [isCmsPreview]);

  return null;
}
