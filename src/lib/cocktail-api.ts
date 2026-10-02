const CATALOG_STORAGE_KEY = "barblend-drink-catalog-v1";

export interface Drink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strInstructions: string | null;
  strCategory?: string | null;
  strAlcoholic?: string | null;
  strGlass?: string | null;
  strIngredient1?: string | null;
  strIngredient2?: string | null;
  strIngredient3?: string | null;
  strIngredient4?: string | null;
  strIngredient5?: string | null;
  strIngredient6?: string | null;
  strIngredient7?: string | null;
  strIngredient8?: string | null;
  strIngredient9?: string | null;
  strIngredient10?: string | null;
  strIngredient11?: string | null;
  strIngredient12?: string | null;
  strIngredient13?: string | null;
  strIngredient14?: string | null;
  strIngredient15?: string | null;
  strMeasure1?: string | null;
  strMeasure2?: string | null;
  strMeasure3?: string | null;
  strMeasure4?: string | null;
  strMeasure5?: string | null;
  strMeasure6?: string | null;
  strMeasure7?: string | null;
  strMeasure8?: string | null;
  strMeasure9?: string | null;
  strMeasure10?: string | null;
  strMeasure11?: string | null;
  strMeasure12?: string | null;
  strMeasure13?: string | null;
  strMeasure14?: string | null;
  strMeasure15?: string | null;
}

const INGREDIENT_KEYS = [
  "strIngredient1",
  "strIngredient2",
  "strIngredient3",
  "strIngredient4",
  "strIngredient5",
  "strIngredient6",
  "strIngredient7",
  "strIngredient8",
  "strIngredient9",
  "strIngredient10",
  "strIngredient11",
  "strIngredient12",
  "strIngredient13",
  "strIngredient14",
  "strIngredient15",
] as const;

const MEASURE_KEYS = [
  "strMeasure1",
  "strMeasure2",
  "strMeasure3",
  "strMeasure4",
  "strMeasure5",
  "strMeasure6",
  "strMeasure7",
  "strMeasure8",
  "strMeasure9",
  "strMeasure10",
  "strMeasure11",
  "strMeasure12",
  "strMeasure13",
  "strMeasure14",
  "strMeasure15",
] as const;

export type IngredientLine = {
  ingredient: string;
  measure: string | null;
};

export class RateLimitError extends Error {
  retryAfter: number;
  kind: "visitor" | "global";

  constructor(message: string, retryAfter: number, kind: "visitor" | "global" = "visitor") {
    super(message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    this.kind = kind;
  }
}

export function getDrinkIngredients(drink: Drink): string[] {
  return INGREDIENT_KEYS.map((key) => drink[key]).filter((value): value is string =>
    Boolean(value?.trim())
  );
}

export function getDrinkIngredientLines(drink: Drink): IngredientLine[] {
  return INGREDIENT_KEYS.flatMap((key, index) => {
    const ingredient = drink[key]?.trim();
    if (!ingredient) return [];
    const measure = drink[MEASURE_KEYS[index]]?.trim() || null;
    return [{ ingredient, measure }];
  });
}

export function findSimilarDrinks(
  drink: Drink,
  candidates: Drink[],
  limit = 5
): Drink[] {
  const ingredients = new Set(
    getDrinkIngredients(drink).map((ingredient) => ingredient.trim().toLowerCase())
  );
  const category = drink.strCategory?.trim().toLowerCase();
  const alcoholic = drink.strAlcoholic?.trim().toLowerCase();
  const glass = drink.strGlass?.trim().toLowerCase();

  return candidates
    .filter((candidate) => candidate.idDrink !== drink.idDrink)
    .map((candidate) => {
      const sharedIngredients = getDrinkIngredients(candidate).filter((ingredient) =>
        ingredients.has(ingredient.trim().toLowerCase())
      ).length;
      const score =
        sharedIngredients * 3 +
        (category && candidate.strCategory?.trim().toLowerCase() === category ? 4 : 0) +
        (alcoholic && candidate.strAlcoholic?.trim().toLowerCase() === alcoholic ? 1 : 0) +
        (glass && candidate.strGlass?.trim().toLowerCase() === glass ? 1 : 0);

      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.candidate.strDrink.localeCompare(b.candidate.strDrink, undefined, {
          sensitivity: "base",
        })
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function instructionTeaser(text: string | null | undefined, max = 90): string | null {
  if (!text?.trim()) return null;
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trimEnd()}…`;
}

async function apiGet<T>(params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api/cocktails?${query.toString()}`);
  const payload = (await response.json().catch(() => ({}))) as {
    drinks?: Drink[] | null;
    drink?: Drink | null;
    categories?: string[];
    message?: string;
    retryAfter?: number;
    error?: string;
  };

  if (response.status === 429 || response.status === 503) {
    throw new RateLimitError(
      payload.message ?? "Easy there, bartender — try again in a moment.",
      Math.max(1, payload.retryAfter ?? 30),
      response.status === 503 ? "global" : "visitor"
    );
  }

  if (!response.ok) {
    throw new Error(payload.error ?? "upstream");
  }

  return payload as T;
}

export async function searchByName(name: string): Promise<Drink[] | null> {
  const payload = await apiGet<{ drinks: Drink[] | null }>({
    type: "search",
    q: name,
  });
  return payload.drinks ?? null;
}

export async function fetchRandomDrink(): Promise<Drink | null> {
  const payload = await apiGet<{ drink: Drink | null }>({ type: "random" });
  return payload.drink ?? null;
}

export async function fetchDrinksByLetter(letter: string): Promise<Drink[]> {
  const normalized = letter.trim().toLowerCase().slice(0, 1);
  if (!/[a-z]/.test(normalized)) return [];

  const payload = await apiGet<{ drinks: Drink[] }>({
    type: "letter",
    q: normalized,
  });
  return payload.drinks ?? [];
}

export async function fetchCategories(): Promise<string[]> {
  const payload = await apiGet<{ categories: string[] }>({ type: "categories" });
  return payload.categories ?? [];
}

function readCachedCatalog(): Drink[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Drink[];
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedCatalog(drinks: Drink[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(drinks));
  } catch {
    // sessionStorage may be full or blocked — memory cache still works
  }
}

let catalogPromise: Promise<Drink[]> | null = null;
let memoryCatalog: Drink[] | null = null;

async function fetchCatalogFromApi(): Promise<Drink[]> {
  const payload = await apiGet<{ drinks: Drink[] }>({ type: "catalog" });
  return payload.drinks ?? [];
}

/** One catalog request per session; the server caches the 26 letter fetches. */
export async function getDrinkCatalog(): Promise<Drink[]> {
  if (memoryCatalog?.length) return memoryCatalog;

  const cached = readCachedCatalog();
  if (cached?.length) {
    memoryCatalog = cached;
    return cached;
  }

  if (!catalogPromise) {
    catalogPromise = fetchCatalogFromApi()
      .then((drinks) => {
        memoryCatalog = drinks;
        writeCachedCatalog(drinks);
        return drinks;
      })
      .finally(() => {
        catalogPromise = null;
      });
  }

  return catalogPromise;
}

export function filterCatalogByLetter(catalog: Drink[], letter: string): Drink[] {
  const normalized = letter.trim().toLowerCase().slice(0, 1);
  if (!/[a-z]/.test(normalized)) return [];
  return catalog.filter((drink) => drink.strDrink.trim().toLowerCase().startsWith(normalized));
}

export function filterCatalogByCategory(catalog: Drink[], category: string): Drink[] {
  const needle = category.trim().toLowerCase();
  if (!needle) return [];
  return catalog.filter((drink) => drink.strCategory?.trim().toLowerCase() === needle);
}

/** Prefer catalog; fall back to a single letter fetch if catalog isn't ready. */
export async function browseByLetter(letter: string): Promise<Drink[]> {
  const normalized = letter.trim().toLowerCase().slice(0, 1);
  if (memoryCatalog?.length || readCachedCatalog()?.length) {
    const catalog = await getDrinkCatalog();
    return filterCatalogByLetter(catalog, normalized);
  }
  return fetchDrinksByLetter(normalized);
}
