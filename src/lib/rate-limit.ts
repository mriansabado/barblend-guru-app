/**
 * In-memory limits. Per-instance on Amplify, which is enough to
 * blunt a script or a traffic spike without Redis.
 *
 * Browsing stays cheap: letter, category, and catalog responses are cached,
 * so they barely touch Cocktail DB. Search and surprise are not.
 *
 * Per visitor, every request: 20 / 15s and 120 / 10 min.
 *   A full explore (alphabet, searches, a few surprises) fits.
 *   A tight loop still gets cut in a couple of seconds.
 * Per visitor, uncached lookups (search + surprise): 18 / minute.
 * Whole app → Cocktail DB: 60 origin calls / minute.
 */
const IP_BURST = { windowMs: 15_000, max: 20 } as const;
const IP_WINDOW = { windowMs: 10 * 60_000, max: 120 } as const;
const IP_ORIGIN = { windowMs: 60_000, max: 18 } as const;
const ORIGIN_WINDOW = { windowMs: 60_000, max: 60 } as const;

type HitResult = { ok: true; remaining: number } | { ok: false; retryAfterSec: number };

const burstHits = new Map<string, number[]>();
const windowHits = new Map<string, number[]>();
const originByIp = new Map<string, number[]>();
let originHits: number[] = [];
let sweeps = 0;

function prune(times: number[], windowMs: number, now: number) {
  const cutoff = now - windowMs;
  let i = 0;
  while (i < times.length && times[i] <= cutoff) i += 1;
  return i === 0 ? times : times.slice(i);
}

function hitMap(
  map: Map<string, number[]>,
  key: string,
  windowMs: number,
  max: number,
  now: number
): HitResult {
  const next = prune(map.get(key) ?? [], windowMs, now);
  if (next.length >= max) {
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - next[0])) / 1000));
    map.set(key, next);
    return { ok: false, retryAfterSec };
  }
  next.push(now);
  map.set(key, next);
  return { ok: true, remaining: max - next.length };
}

function sweepMap(map: Map<string, number[]>, windowMs: number, now: number) {
  for (const [key, times] of map) {
    const next = prune(times, windowMs, now);
    if (next.length) map.set(key, next);
    else map.delete(key);
  }
}

function sweep(now: number) {
  sweeps += 1;
  if (sweeps % 200 !== 0) return;
  sweepMap(burstHits, IP_BURST.windowMs, now);
  sweepMap(windowHits, IP_WINDOW.windowMs, now);
  sweepMap(originByIp, IP_ORIGIN.windowMs, now);
}

export function consumeIpLimit(ip: string): HitResult {
  const now = Date.now();
  sweep(now);
  const burst = hitMap(burstHits, ip, IP_BURST.windowMs, IP_BURST.max, now);
  if (!burst.ok) return burst;
  return hitMap(windowHits, ip, IP_WINDOW.windowMs, IP_WINDOW.max, now);
}

/** Search misses and surprise rolls. Shared menu caches do not count. */
export function consumePersonalOriginLimit(ip: string): HitResult {
  const now = Date.now();
  sweep(now);
  return hitMap(originByIp, ip, IP_ORIGIN.windowMs, IP_ORIGIN.max, now);
}

export function consumeOriginLimit(): HitResult {
  const now = Date.now();
  originHits = prune(originHits, ORIGIN_WINDOW.windowMs, now);
  if (originHits.length >= ORIGIN_WINDOW.max) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((ORIGIN_WINDOW.windowMs - (now - originHits[0])) / 1000)
    );
    return { ok: false, retryAfterSec };
  }
  originHits.push(now);
  return { ok: true, remaining: ORIGIN_WINDOW.max - originHits.length };
}

export function rateLimitCopy(retryAfterSec: number, kind: "visitor" | "global" = "visitor") {
  const wait = Math.max(1, retryAfterSec);
  if (kind === "global") {
    return wait < 60
      ? `The whole bar's hopping — hang tight ${wait}s and try again.`
      : "The whole bar's hopping — give it a minute and try another round.";
  }
  if (wait < 60) {
    return `Easy there, bartender — the tap needs a short rest. Try again in ${wait}s.`;
  }
  const mins = Math.ceil(wait / 60);
  return `You've mixed a lot in a short stretch. Come back in about ${mins} min.`;
}
