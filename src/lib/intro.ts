/** Wall-clock helper so 3D garnish pops stay synced to page load, not canvas mount. */
const introStartedAt =
  typeof performance !== "undefined" ? performance.now() : 0;

export function introElapsedSeconds() {
  if (typeof performance === "undefined") return 10;
  return (performance.now() - introStartedAt) / 1000;
}
