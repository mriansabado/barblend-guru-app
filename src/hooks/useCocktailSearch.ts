"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Drink,
  browseByLetter,
  fetchCategories,
  filterCatalogByCategory,
  fetchRandomDrink,
  getDrinkCatalog,
  searchByIngredient,
  searchByName,
} from "@/lib/cocktail-api";

export type SearchType = "name" | "ingredient";

export const SPIRIT_CHIPS = [
  "Vodka",
  "Gin",
  "Rum",
  "Tequila",
  "Whiskey",
  "Triple Sec",
] as const;

export const BROWSE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const FEATURED_CATEGORIES = [
  "Cocktail",
  "Ordinary Drink",
  "Shot",
  "Punch / Party Drink",
  "Shake",
] as const;

export function useCocktailSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [searchResults, setSearchResults] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surprisePulse, setSurprisePulse] = useState(0);
  const [resultsHeadline, setResultsHeadline] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch(() => {
        if (!cancelled) setCategories([...FEATURED_CATEGORIES]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      return await getDrinkCatalog();
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const runSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError(
        searchType === "name"
          ? "Type a cocktail name to get started."
          : "Type an ingredient like Gin or Lime."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedDrink(null);
    setShowAllResults(false);
    setResultsHeadline(null);

    try {
      if (searchType === "name") {
        const drinks = await searchByName(trimmed);
        if (drinks?.length) {
          setSearchResults(drinks);
          setResultsHeadline(`${drinks.length} drinks ready to mix`);
        } else {
          const random = await fetchRandomDrink();
          setSearchResults([]);
          if (random) {
            setSelectedDrink(random);
            setError("No exact match — here's a fun alternative instead.");
          } else {
            setError("No match found. Try a different spelling?");
          }
        }
      } else {
        setCatalogLoading(true);
        const drinks = await searchByIngredient(trimmed);
        setCatalogLoading(false);
        if (drinks.length) {
          setSearchResults(drinks);
          setResultsHeadline(
            `${drinks.length} drinks with ${trimmed}`
          );
        } else {
          setSearchResults([]);
          setError("Nothing with that ingredient — try Vodka, Rum, or Mint.");
        }
      }
      setHasSearched(true);
    } catch {
      setError("Connection hiccup. Give it another shake.");
      setSearchResults([]);
      setCatalogLoading(false);
    } finally {
      setLoading(false);
    }
  }, [query, searchType]);

  const runSpiritChip = useCallback(
    async (spirit: string) => {
      setSearchType("ingredient");
      setQuery(spirit);
      setLoading(true);
      setError(null);
      setSelectedDrink(null);
      setShowAllResults(false);

      try {
        setCatalogLoading(true);
        const drinks = await searchByIngredient(spirit);
        setCatalogLoading(false);
        if (drinks.length) {
          setSearchResults(drinks);
          setResultsHeadline(`${drinks.length} drinks with ${spirit}`);
        } else {
          setSearchResults([]);
          setError("Nothing with that ingredient — try another spirit.");
        }
        setHasSearched(true);
      } catch {
        setError("Connection hiccup. Give it another shake.");
        setSearchResults([]);
        setCatalogLoading(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const runBrowseLetter = useCallback(async (letter: string) => {
    setLoading(true);
    setError(null);
    setSelectedDrink(null);
    setShowAllResults(false);
    setQuery("");

    try {
      const drinks = await browseByLetter(letter);
      if (drinks.length) {
        setSearchResults(drinks);
        setResultsHeadline(`Browsing “${letter.toUpperCase()}” — ${drinks.length} drinks`);
      } else {
        setSearchResults([]);
        setError(`No drinks starting with ${letter.toUpperCase()} yet.`);
      }
      setHasSearched(true);
    } catch {
      setError("Connection hiccup. Give it another shake.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const runBrowseCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    setSelectedDrink(null);
    setShowAllResults(false);
    setQuery("");

    try {
      const catalog = await ensureCatalog();
      const drinks = filterCatalogByCategory(catalog, category);
      if (drinks.length) {
        setSearchResults(drinks);
        setResultsHeadline(`${category} — ${drinks.length} drinks`);
      } else {
        setSearchResults([]);
        setError(`No drinks in ${category} right now.`);
      }
      setHasSearched(true);
    } catch {
      setError("Connection hiccup. Give it another shake.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [ensureCatalog]);

  const runSurprise = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedDrink(null);
    setShowAllResults(false);
    setResultsHeadline(null);

    try {
      const random = await fetchRandomDrink();
      if (random) {
        setSelectedDrink(random);
        setHasSearched(true);
        setSurprisePulse((n) => n + 1);
      } else {
        setError("The shaker's empty — try again in a sec.");
      }
    } catch {
      setError("Connection hiccup. Give it another shake.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setQuery("");
    setSearchResults([]);
    setSelectedDrink(null);
    setHasSearched(false);
    setShowAllResults(false);
    setError(null);
    setResultsHeadline(null);
  }, []);

  const selectDrink = useCallback((drink: Drink) => setSelectedDrink(drink), []);
  const backToResults = useCallback(() => setSelectedDrink(null), []);

  const browseCategories =
    categories.length > 0
      ? FEATURED_CATEGORIES.filter((c) =>
          categories.some((cat) => cat.toLowerCase() === c.toLowerCase())
        )
      : [...FEATURED_CATEGORIES];

  return {
    query,
    setQuery,
    searchType,
    setSearchType,
    searchResults,
    selectedDrink,
    hasSearched,
    showAllResults,
    setShowAllResults,
    loading,
    catalogLoading,
    error,
    clearError,
    surprisePulse,
    resultsHeadline,
    browseCategories,
    runSearch,
    runSpiritChip,
    runBrowseLetter,
    runBrowseCategory,
    runSurprise,
    reset,
    selectDrink,
    backToResults,
  };
}
