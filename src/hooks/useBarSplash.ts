"use client";

import { useCallback, useEffect, useState } from "react";
import { SPLASH_ENTER_MS, SPLASH_TITLE_MS } from "@/lib/intro";

export function useBarSplash() {
  const [showTitle, setShowTitle] = useState(false);
  const [entered, setEntered] = useState(false);
  const [clickGuard, setClickGuard] = useState(false);

  const enter = useCallback(() => {
    setShowTitle(true);
    setEntered(true);
    setClickGuard(true);
    window.setTimeout(() => setClickGuard(false), 450);
  }, []);

  useEffect(() => {
    if (entered) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) {
      setShowTitle(true);
      setEntered(true);
      return;
    }

    const titleTimer = window.setTimeout(
      () => setShowTitle(true),
      SPLASH_TITLE_MS
    );
    const enterTimer = window.setTimeout(() => {
      setShowTitle(true);
      setEntered(true);
    }, SPLASH_ENTER_MS);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
        event.preventDefault();
        enter();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(titleTimer);
      window.clearTimeout(enterTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [enter, entered]);

  return { showTitle, entered, enter, clickGuard };
}
