"use client";

import { useCallback, useState } from "react";
import {
  Drink,
  fetchRandomDrink,
  searchByIngredient,
  searchByName,
} from "@/lib/cocktail-api";

export type SearchType = "name" | "ingredient";

export function useCocktailSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [searchResults, setSearchResults] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surprisePulse, setSurprisePulse] = useState(0);

  const clearError = useCallback(() => setError(null), []);

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

    try {
      if (searchType === "name") {
        const drinks = await searchByName(trimmed);
        if (drinks?.length) {
          setSearchResults(drinks);
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
        const drinks = await searchByIngredient(trimmed);
        if (drinks.length) {
          setSearchResults(drinks);
        } else {
          setSearchResults([]);
          setError("Nothing with that ingredient — try Vodka, Rum, or Mint.");
        }
      }
      setHasSearched(true);
    } catch {
      setError("Connection hiccup. Give it another shake.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, searchType]);

  const runSurprise = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedDrink(null);
    setShowAllResults(false);

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
  }, []);

  const selectDrink = useCallback((drink: Drink) => setSelectedDrink(drink), []);
  const backToResults = useCallback(() => setSelectedDrink(null), []);

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
    error,
    clearError,
    surprisePulse,
    runSearch,
    runSurprise,
    reset,
    selectDrink,
    backToResults,
  };
}
