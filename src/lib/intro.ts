/** Wall-clock helper so 3D garnish pops stay synced to page load, not canvas mount. */
const introStartedAt =
  typeof performance !== "undefined" ? performance.now() : 0;

export function introElapsedSeconds() {
  if (typeof performance === "undefined") return 10;
  return (performance.now() - introStartedAt) / 1000;
}

/** Drinks-only beat before the title card pops. */
export const SPLASH_TITLE_MS = 1400;

/** Auto-enter the bar if nobody taps. */
export const SPLASH_ENTER_MS = 4000;
