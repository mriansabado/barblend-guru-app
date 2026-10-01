import { consumeOriginLimit } from "@/lib/rate-limit";
import type { Drink } from "@/lib/cocktail-api";

const BASE = "https://www.thecocktaildb.com/api/json/v1/1";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const CATALOG_CONCURRENCY = 3;
const SEARCH_TTL_MS = 5 * 60 * 1000;
const LETTER_TTL_MS = 12 * 60 * 60 * 1000;
const CATEGORIES_TTL_MS = 24 * 60 * 60 * 1000;
const CATALOG_TTL_MS = 12 * 60 * 60 * 1000;
const ORIGIN_TIMEOUT_MS = 8000;

export class OriginBusyError extends Error {
  retryAfterSec: number;
  constructor(retryAfterSec: number) {
    super("origin_busy");
    this.retryAfterSec = retryAfterSec;
  }
}

type CacheEntry<T> = { value: T; at: number };

const searchCache = new Map<string, CacheEntry<Drink[] | null>>();
const letterCache = new Map<string, CacheEntry<Drink[]>>();
let categoriesCache: CacheEntry<string[]> | null = null;
let catalogCache: CacheEntry<Drink[]> | null = null;
let catalogPromise: Promise<Drink[]> | null = null;

function readCache<T>(entry: CacheEntry<T> | undefined, ttl: number): T | undefined {
  if (!entry) return undefined;
  if (Date.now() - entry.at > ttl) return undefined;
  return entry.value;
}

function capCache<T>(map: Map<string, CacheEntry<T>>, max = 200) {
  if (map.size <= max) return;
  const extra = map.size - max;
  const keys = map.keys();
  for (let i = 0; i < extra; i += 1) {
    const key = keys.next().value;
    if (key !== undefined) map.delete(key);
  }
}

async function originGet(path: string): Promise<unknown> {
  const allowed = consumeOriginLimit();
  if (!allowed.ok) throw new OriginBusyError(allowed.retryAfterSec);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ORIGIN_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE}${path}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`origin_${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function drinksFromPayload(payload: unknown): Drink[] | null {
  if (!payload || typeof payload !== "object" || !("drinks" in payload)) return null;
  const drinks = (payload as { drinks: Drink[] | null }).drinks;
  return drinks ?? null;
}

export async function originSearchByName(name: string): Promise<Drink[] | null> {
  const key = name.trim().toLowerCase();
  const cached = readCache(searchCache.get(key), SEARCH_TTL_MS);
  if (cached !== undefined) return cached;

  const payload = await originGet(`/search.php?s=${encodeURIComponent(name)}`);
  const drinks = drinksFromPayload(payload);
  searchCache.set(key, { value: drinks, at: Date.now() });
  capCache(searchCache);
  return drinks;
}

export async function originRandomDrink(): Promise<Drink | null> {
  const payload = await originGet("/random.php");
  const drinks = drinksFromPayload(payload);
  return drinks?.[0] ?? null;
}

export async function originDrinksByLetter(letter: string): Promise<Drink[]> {
  const cached = readCache(letterCache.get(letter), LETTER_TTL_MS);
  if (cached) return cached;

  const payload = await originGet(`/search.php?f=${encodeURIComponent(letter)}`);
  const drinks = drinksFromPayload(payload) ?? [];
  letterCache.set(letter, { value: drinks, at: Date.now() });
  return drinks;
}

export async function originCategories(): Promise<string[]> {
  const cached = readCache(categoriesCache ?? undefined, CATEGORIES_TTL_MS);
  if (cached) return cached;

  const payload = await originGet("/list.php?c=list");
  const rows =
    payload && typeof payload === "object" && "drinks" in payload
      ? ((payload as { drinks: { strCategory: string }[] | null }).drinks ?? [])
      : [];
  const categories = rows.map((row) => row.strCategory).filter(Boolean);
  categoriesCache = { value: categories, at: Date.now() };
  return categories;
}

async function fetchCatalogFromOrigin(): Promise<Drink[]> {
  const byId = new Map<string, Drink>();

  for (let i = 0; i < LETTERS.length; i += CATALOG_CONCURRENCY) {
    const batch = LETTERS.slice(i, i + CATALOG_CONCURRENCY);
    const results = await Promise.all(batch.map((letter) => originDrinksByLetter(letter)));
    for (const drinks of results) {
      for (const drink of drinks) {
        if (drink?.idDrink) byId.set(drink.idDrink, drink);
      }
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.strDrink.localeCompare(b.strDrink, undefined, { sensitivity: "base" })
  );
}

export async function originCatalog(): Promise<Drink[]> {
  const cached = readCache(catalogCache ?? undefined, CATALOG_TTL_MS);
  if (cached?.length) return cached;

  if (!catalogPromise) {
    catalogPromise = fetchCatalogFromOrigin()
      .then((drinks) => {
        catalogCache = { value: drinks, at: Date.now() };
        return drinks;
      })
      .finally(() => {
        catalogPromise = null;
      });
  }

  return catalogPromise;
}
