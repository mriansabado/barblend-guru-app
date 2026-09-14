import axios from "axios";

const BASE = "https://www.thecocktaildb.com/api/json/v1/1";

export interface Drink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strInstructions: string | null;
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

export function getDrinkIngredients(drink: Drink): string[] {
  return INGREDIENT_KEYS.map((key) => drink[key]).filter((value): value is string =>
    Boolean(value?.trim())
  );
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

export async function searchByIngredient(ingredient: string): Promise<Drink[]> {
  const response = await axios.get(
    `${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`
  );
  const drinks: Pick<Drink, "idDrink" | "strDrink" | "strDrinkThumb">[] | null =
    response.data.drinks;

  if (!drinks?.length) return [];

  const detailed = await Promise.all(
    drinks.slice(0, 10).map(async (drink) => {
      try {
        const detailResponse = await axios.get(
          `${BASE}/lookup.php?i=${drink.idDrink}`
        );
        return detailResponse.data.drinks?.[0] as Drink | undefined;
      } catch {
        return undefined;
      }
    })
  );

  return detailed.filter((d): d is Drink => Boolean(d));
}
