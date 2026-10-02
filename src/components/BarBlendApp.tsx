"use client";

import dynamic from "next/dynamic";
import { RecipeDetail } from "@/components/ui/RecipeDetail";
import { ResultsGrid } from "@/components/ui/ResultsGrid";
import { SearchPanel } from "@/components/ui/SearchPanel";
import { useBarSplash } from "@/hooks/useBarSplash";
import { useCocktailSearch } from "@/hooks/useCocktailSearch";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

const HeroSceneClient = dynamic(
  () =>
    import("@/components/hero/HeroScene").then((mod) => ({
      default: mod.HeroScene,
    })),
  { ssr: false }
);

function BrandMark() {
  return (
    <>
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-bar-teal">
        Welcome to the bar
      </p>
      <h1 className="font-display text-6xl font-bold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl">
        <span className="bg-gradient-to-r from-bar-mango via-bar-coral to-bar-pink bg-clip-text text-transparent">
          BarBlend
        </span>{" "}
        Guru
      </h1>
    </>
  );
}

export default function BarBlendApp() {
  const search = useCocktailSearch();
  const { showTitle, entered, enter, clickGuard } = useBarSplash();
  const showGrid = search.searchResults.length > 0 && !search.selectedDrink;
  const showDetail = Boolean(search.selectedDrink);
  const cameFromGrid = showDetail && search.searchResults.length > 0;

  return (
    <LayoutGroup>
      <div className="relative min-h-screen">
        <HeroSceneClient
          surprisePulse={search.surprisePulse}
          showVeil={entered}
        />

        {clickGuard && <div className="fixed inset-0 z-50" aria-hidden />}

        <AnimatePresence>
          {!entered && (
            <motion.button
              type="button"
              aria-label="Enter the bar"
              onPointerDown={enter}
              className="fixed inset-0 z-20 cursor-pointer bg-transparent"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.35 } }}
            />
          )}
        </AnimatePresence>

        {showTitle && !entered && (
          <div className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-4 text-center">
            <motion.div
              layoutId="brand-mark"
              className="text-center"
              initial={{ opacity: 0, scale: 0.78, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <BrandMark />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0.4, 0.85] }}
              transition={{ delay: 0.45, duration: 2.4, repeat: Infinity }}
              className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-white/75"
            >
              tap to step up
            </motion.p>
          </div>
        )}

        {entered && (
          <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-8 sm:pt-14">
            <header className="mb-10 text-center sm:mb-12">
              <motion.div
                layoutId="brand-mark"
                className="text-center"
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
              >
                <BrandMark />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-4 max-w-md text-lg text-bar-muted sm:text-xl"
              >
                Colorful ideas, real recipes — search, explore, or let fate pick your
                next round.
              </motion.p>
            </header>

            <motion.div
              className="mx-auto mb-14 max-w-xl"
              initial={{ opacity: 0, y: 56, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.32,
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
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
                rateLimited={search.rateLimited}
                onDismissError={search.clearError}
              />
            </motion.div>

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

            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-16 text-center text-sm text-white/50"
            >
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
            </motion.footer>
          </main>
        )}
      </div>
    </LayoutGroup>
  );
}
