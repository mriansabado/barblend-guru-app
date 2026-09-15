"use client";

import dynamic from "next/dynamic";
import { RecipeDetail } from "@/components/ui/RecipeDetail";
import { ResultsGrid } from "@/components/ui/ResultsGrid";
import { SearchPanel } from "@/components/ui/SearchPanel";
import { useCocktailSearch } from "@/hooks/useCocktailSearch";
import { AnimatePresence, motion } from "framer-motion";

const HeroSceneClient = dynamic(
  () =>
    import("@/components/hero/HeroScene").then((mod) => ({
      default: mod.HeroScene,
    })),
  { ssr: false }
);

export default function BarBlendApp() {
  const search = useCocktailSearch();
  const showGrid = search.searchResults.length > 0 && !search.selectedDrink;
  const showDetail = Boolean(search.selectedDrink);
  const cameFromGrid = showDetail && search.searchResults.length > 0;

  return (
    <div className="relative min-h-screen">
      <HeroSceneClient surprisePulse={search.surprisePulse} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-8 sm:pt-14">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center sm:mb-12"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-bar-teal">
            Welcome to the bar
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
            <span className="bg-gradient-to-r from-bar-mango via-bar-coral to-bar-pink bg-clip-text text-transparent">
              BarBlend
            </span>{" "}
            Guru
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-bar-muted sm:text-xl">
            Colorful ideas, real recipes — search, explore, or let fate pick your next round.
          </p>
        </motion.header>

        <div className="mx-auto mb-14 max-w-xl">
          <SearchPanel
            query={search.query}
            onQueryChange={search.setQuery}
            searchType={search.searchType}
            onSearchTypeChange={search.setSearchType}
            onSearch={search.runSearch}
            onSurprise={search.runSurprise}
            onReset={search.reset}
            onSpiritChip={search.runSpiritChip}
            onBrowseLetter={search.runBrowseLetter}
            onBrowseCategory={search.runBrowseCategory}
            browseCategories={search.browseCategories}
            hasSearched={search.hasSearched}
            loading={search.loading}
            catalogLoading={search.catalogLoading}
            error={search.error}
            onDismissError={search.clearError}
          />
        </div>

        <AnimatePresence mode="wait">
          {showGrid && (
            <ResultsGrid
              key="grid"
              drinks={search.searchResults}
              showAll={search.showAllResults}
              onShowAll={() => search.setShowAllResults(true)}
              onSelect={search.selectDrink}
              headline={search.resultsHeadline}
            />
          )}
          {showDetail && search.selectedDrink && (
            <RecipeDetail
              key="detail"
              drink={search.selectedDrink}
              showBack={cameFromGrid}
              onBack={search.backToResults}
            />
          )}
        </AnimatePresence>

        <footer className="mt-16 text-center text-sm text-white/50">
          Recipes from{" "}
          <a
            href="https://www.thecocktaildb.com"
            className="text-bar-teal underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Cocktail DB
          </a>
          . Drink responsibly.
        </footer>
      </main>
    </div>
  );
}
