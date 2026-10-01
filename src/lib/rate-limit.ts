/**
 * In-memory limits. Per-instance on Amplify, which is enough to
 * blunt scripts and an Instagram spike without a Redis dependency.
 *
 * Per visitor: 8 actions / 15s, 45 / 10 min — a real mixing session is fine.
 * Whole app → Cocktail DB: 80 origin calls / minute — protects the shared key.
 */
const IP_BURST = { windowMs: 15_000, max: 8 } as const;
const IP_WINDOW = { windowMs: 10 * 60_000, max: 45 } as const;
const ORIGIN_WINDOW = { windowMs: 60_000, max: 80 } as const;

type HitResult = { ok: true; remaining: number } | { ok: false; retryAfterSec: number };

const burstHits = new Map<string, number[]>();
const windowHits = new Map<string, number[]>();
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

function sweep(now: number) {
  sweeps += 1;
  if (sweeps % 200 !== 0) return;
  for (const [key, times] of burstHits) {
    const next = prune(times, IP_BURST.windowMs, now);
    if (next.length) burstHits.set(key, next);
    else burstHits.delete(key);
  }
  for (const [key, times] of windowHits) {
    const next = prune(times, IP_WINDOW.windowMs, now);
    if (next.length) windowHits.set(key, next);
    else windowHits.delete(key);
  }
}

export function consumeIpLimit(ip: string): HitResult {
  const now = Date.now();
  sweep(now);
  const burst = hitMap(burstHits, ip, IP_BURST.windowMs, IP_BURST.max, now);
  if (!burst.ok) return burst;
  return hitMap(windowHits, ip, IP_WINDOW.windowMs, IP_WINDOW.max, now);
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
