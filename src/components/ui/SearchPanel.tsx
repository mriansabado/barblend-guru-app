"use client";

import { BarButton } from "@/components/ui/BarButton";
import { WarmCard } from "@/components/ui/WarmCard";
import { SearchType } from "@/hooks/useCocktailSearch";
import { cn } from "@/lib/cn";
import { Dices, Search, Sparkles, X } from "lucide-react";

interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  searchType: SearchType;
  onSearchTypeChange: (type: SearchType) => void;
  onSearch: () => void;
  onSurprise: () => void;
  onReset: () => void;
  hasSearched: boolean;
  loading: boolean;
  error: string | null;
  onDismissError: () => void;
}

export function SearchPanel(props: SearchPanelProps) {
  const {
    query,
    onQueryChange,
    searchType,
    onSearchTypeChange,
    onSearch,
    onSurprise,
    onReset,
    hasSearched,
    loading,
    error,
    onDismissError,
  } = props;

  return (
    <WarmCard className="p-6 sm:p-8">
      <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-bar-mango">
        <Sparkles className="h-4 w-4" />
        What are we making tonight?
      </p>

      <div className="mb-5 flex rounded-2xl bg-black/20 p-1">
        {(
          [
            { id: "name" as const, label: "Cocktail name" },
            { id: "ingredient" as const, label: "What's in the cabinet" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSearchTypeChange(id)}
            className={cn(
              "flex-1 rounded-xl px-2 py-2.5 text-sm font-bold transition-all sm:py-3",
              searchType === id
                ? "bg-gradient-to-r from-bar-coral/90 to-bar-pink/90 text-white shadow-md"
                : "text-bar-muted hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-2xl border border-bar-mango/40 bg-bar-mango/15 px-4 py-3 text-sm text-amber-50"
        >
          <span className="flex-1">{error}</span>
          <button type="button" onClick={onDismissError} aria-label="Dismiss">
            <X className="h-4 w-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}

      <div className="relative mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={
            searchType === "name" ? "Try Margarita or Negroni…" : "Vodka, lime, mint…"
          }
          className="w-full rounded-2xl border-2 border-white/25 bg-bar-plum/70 py-4 pl-4 pr-11 text-lg text-white shadow-inner placeholder:text-white/50 focus:border-bar-teal focus:bg-bar-plum/85 focus:outline-none focus:ring-2 focus:ring-bar-teal/40"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/60 hover:text-white"
            aria-label="Clear"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <BarButton type="button" onClick={onSearch} loading={loading}>
          <Search className="h-5 w-5" />
          Find my drink
        </BarButton>
        <BarButton type="button" variant="teal" onClick={onSurprise} loading={loading}>
          <Dices className="h-5 w-5" />
          Shake it up — surprise me
        </BarButton>
        {hasSearched && (
          <BarButton type="button" variant="soft" onClick={onReset}>
            Start fresh
          </BarButton>
        )}
      </div>
    </WarmCard>
  );
}
