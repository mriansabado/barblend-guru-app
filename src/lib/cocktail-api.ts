import axios from "axios";

const BASE = "https://www.thecocktaildb.com/api/json/v1/1";
const CATALOG_STORAGE_KEY = "barblend-drink-catalog-v1";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const CATALOG_CONCURRENCY = 3;

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

export function instructionTeaser(text: string | null | undefined, max = 90): string | null {
  if (!text?.trim()) return null;
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trimEnd()}…`;
}

export async function searchByName(name: string): Promise<Drink[] | null> {
  const response = await axios.get(`${BASE}/search.php?s=${encodeURIComponent(name)}`);
  return response.data.drinks ?? null;
}

export async function fetchRandomDrink(): Promise<Drink | null> {
  const response = await axios.get(`${BASE}/random.php`);
  const drinks: Drink[] | null = response.data.drinks;
  return drinks?.[0] ?? null;
}

export async function fetchDrinksByLetter(letter: string): Promise<Drink[]> {
  const normalized = letter.trim().toLowerCase().slice(0, 1);
  if (!/[a-z]/.test(normalized)) return [];

  const response = await axios.get(`${BASE}/search.php?f=${normalized}`);
  return (response.data.drinks as Drink[] | null) ?? [];
}

export async function fetchCategories(): Promise<string[]> {
  const response = await axios.get(`${BASE}/list.php?c=list`);
  const rows: { strCategory: string }[] | null = response.data.drinks;
  return rows?.map((row) => row.strCategory).filter(Boolean) ?? [];
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
  const byId = new Map<string, Drink>();

  for (let i = 0; i < LETTERS.length; i += CATALOG_CONCURRENCY) {
    const batch = LETTERS.slice(i, i + CATALOG_CONCURRENCY);
    const results = await Promise.all(batch.map((letter) => fetchDrinksByLetter(letter)));
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

/** Seeds once per session (~26 letter calls), then reuses memory/sessionStorage. */
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

function ingredientMatchesQuery(ingredient: string, needle: string): boolean {
  const lower = ingredient.toLowerCase();
  if (lower === needle || lower.startsWith(`${needle} `)) return true;
  // Token match so "gin" hits "Dry Gin" but not "Ginger"
  return lower.split(/[\s,/()-]+/).some((token) => token === needle);
}

export function filterCatalogByIngredient(catalog: Drink[], ingredient: string): Drink[] {
  const needle = ingredient.trim().toLowerCase();
  if (!needle) return [];

  return catalog.filter((drink) =>
    getDrinkIngredients(drink).some((ing) => ingredientMatchesQuery(ing, needle))
  );
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

export async function searchByIngredient(ingredient: string): Promise<Drink[]> {
  const catalog = await getDrinkCatalog();
  return filterCatalogByIngredient(catalog, ingredient);
}
