"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Drink,
  RateLimitError,
  browseByLetter,
  fetchCategories,
  filterCatalogByCategory,
  fetchRandomDrink,
  getDrinkCatalog,
  searchByName,
} from "@/lib/cocktail-api";
import { rateLimitCopy } from "@/lib/rate-limit";

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
  const [searchResults, setSearchResults] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [limitKind, setLimitKind] = useState<"visitor" | "global">("visitor");
  const [surprisePulse, setSurprisePulse] = useState(0);
  const [resultsHeadline, setResultsHeadline] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const clearError = useCallback(() => {
    setError(null);
    setRateLimitedUntil(null);
  }, []);

  const fail = useCallback((err: unknown) => {
    if (err instanceof RateLimitError) {
      setLimitKind(err.kind);
      setRateLimitedUntil(Date.now() + err.retryAfter * 1000);
      setError(err.message);
      return;
    }
    setError("Connection hiccup. Give it another shake.");
  }, []);

  useEffect(() => {
    if (!rateLimitedUntil) return;
    const tick = () => {
      const wait = Math.ceil((rateLimitedUntil - Date.now()) / 1000);
      if (wait <= 0) {
        setRateLimitedUntil(null);
        setError(null);
        return;
      }
      setError(rateLimitCopy(wait, limitKind));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [rateLimitedUntil, limitKind]);

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
      setError("Type a cocktail name to get started.");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedDrink(null);
    setShowAllResults(false);
    setResultsHeadline(null);

    try {
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
      setHasSearched(true);
    } catch (err) {
      fail(err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, fail]);

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
    } catch (err) {
      fail(err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [fail]);

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
    } catch (err) {
      fail(err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [ensureCatalog, fail]);

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
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  }, [fail]);

  const reset = useCallback(() => {
    setQuery("");
    setSearchResults([]);
    setSelectedDrink(null);
    setHasSearched(false);
    setShowAllResults(false);
    setError(null);
    setRateLimitedUntil(null);
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
    searchResults,
    selectedDrink,
    hasSearched,
    showAllResults,
    setShowAllResults,
    loading,
    catalogLoading,
    error,
    rateLimited: Boolean(rateLimitedUntil && rateLimitedUntil > Date.now()),
    clearError,
    surprisePulse,
    resultsHeadline,
    browseCategories,
    runSearch,
    runBrowseLetter,
    runBrowseCategory,
    runSurprise,
    reset,
    selectDrink,
    backToResults,
  };
}
