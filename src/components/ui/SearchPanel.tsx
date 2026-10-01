"use client";

import { BarButton } from "@/components/ui/BarButton";
import { WarmCard } from "@/components/ui/WarmCard";
import {
  BROWSE_LETTERS,
  SPIRIT_CHIPS,
  SearchType,
} from "@/hooks/useCocktailSearch";
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
  onSpiritChip: (spirit: string) => void;
  onBrowseLetter: (letter: string) => void;
  onBrowseCategory: (category: string) => void;
  browseCategories: string[];
  hasSearched: boolean;
  loading: boolean;
  catalogLoading: boolean;
  error: string | null;
  rateLimited?: boolean;
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
    onSpiritChip,
    onBrowseLetter,
    onBrowseCategory,
    browseCategories,
    hasSearched,
    loading,
    catalogLoading,
    error,
    rateLimited = false,
    onDismissError,
  } = props;

  const busy = loading || catalogLoading || rateLimited;

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

      {catalogLoading && (
        <p className="mb-4 text-center text-sm font-semibold text-bar-teal">
          Stocking the bar… one moment while we load the full menu.
        </p>
      )}

      <div className="relative mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && onSearch()}
          placeholder={
            searchType === "name" ? "Try Margarita or Negroni…" : "Vodka, lime, mint…"
          }
          className="w-full rounded-2xl border-2 border-white/25 bg-bar-field py-4 pl-4 pr-11 text-lg text-bar-ink shadow-inner placeholder:text-bar-ink/45 focus:border-bar-teal focus:bg-bar-field focus:outline-none focus:ring-2 focus:ring-bar-teal/40"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-bar-ink/55 hover:text-bar-ink"
            aria-label="Clear"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {searchType === "ingredient" && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">
            Quick spirits
          </p>
          <div className="flex flex-wrap gap-2">
            {SPIRIT_CHIPS.map((spirit) => (
              <button
                key={spirit}
                type="button"
                disabled={busy}
                onClick={() => onSpiritChip(spirit)}
                className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-bar-coral/40 disabled:opacity-50"
              >
                {spirit}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <BarButton type="button" onClick={onSearch} loading={busy}>
          <Search className="h-5 w-5" />
          Find my drink
        </BarButton>
        <BarButton type="button" variant="teal" onClick={onSurprise} loading={busy}>
          <Dices className="h-5 w-5" />
          Shake it up — surprise me
        </BarButton>
        {hasSearched && (
          <BarButton type="button" variant="soft" onClick={onReset}>
            Start fresh
          </BarButton>
        )}
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
          Browse the bar
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {BROWSE_LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              disabled={busy}
              onClick={() => onBrowseLetter(letter)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/25 text-xs font-bold text-bar-muted transition hover:bg-bar-teal/30 hover:text-white disabled:opacity-50"
              aria-label={`Browse drinks starting with ${letter}`}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {browseCategories.map((category) => (
            <button
              key={category}
              type="button"
              disabled={busy}
              onClick={() => onBrowseCategory(category)}
              className="rounded-xl border border-white/15 bg-transparent px-3 py-1.5 text-xs font-semibold text-bar-muted transition hover:border-bar-mango/50 hover:text-bar-mango disabled:opacity-50"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </WarmCard>
  );
}
