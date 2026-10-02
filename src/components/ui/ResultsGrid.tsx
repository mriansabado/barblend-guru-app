"use client";

import { Drink, getDrinkIngredients, instructionTeaser } from "@/lib/cocktail-api";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface ResultsGridProps {
  drinks: Drink[];
  showAll: boolean;
  onShowAll: () => void;
  onSelect: (drink: Drink) => void;
  headline?: string | null;
}

const INITIAL_VISIBLE = 12;

const cardColors = [
  "from-bar-coral/20 to-transparent",
  "from-bar-mango/25 to-transparent",
  "from-bar-teal/20 to-transparent",
  "from-bar-pink/20 to-transparent",
];

export function ResultsGrid({
  drinks,
  showAll,
  onShowAll,
  onSelect,
  headline,
}: ResultsGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const visible = showAll ? drinks : drinks.slice(0, INITIAL_VISIBLE);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [drinks]);

  return (
    <section ref={sectionRef} id="results" className="w-full max-w-6xl scroll-mt-8">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display mb-8 text-center text-3xl font-bold text-white sm:text-4xl"
      >
        {headline ?? `${drinks.length} drinks ready to mix`}
      </motion.h2>
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        {visible.map((drink, index) => {
          const ingredients = getDrinkIngredients(drink).slice(0, 3);
          const teaser = instructionTeaser(drink.strInstructions);
          const tint = cardColors[index % cardColors.length];
          return (
            <motion.button
              type="button"
              key={drink.idDrink}
              initial={{ opacity: 0, y: 28, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 22 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(drink)}
              className={`warm-glass group overflow-hidden text-left transition-shadow hover:shadow-2xl hover:shadow-bar-coral/20`}
            >
              <div className={`relative h-48 bg-gradient-to-b ${tint}`}>
                <img
                  src={drink.strDrinkThumb}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bar-plum/90 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-bold text-white">{drink.strDrink}</h3>
                {drink.strCategory && (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-bar-teal/80">
                    {drink.strCategory}
                  </p>
                )}
                <p className="mt-2 text-sm text-bar-muted">{ingredients.join(" · ")}</p>
                {teaser && (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/70">
                    {teaser}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-bar-teal">
                  Open recipe
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
      {drinks.length > INITIAL_VISIBLE && !showAll && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={onShowAll}
            className="font-display rounded-full bg-white/15 px-8 py-3 text-lg font-bold text-white hover:bg-white/25"
          >
            See all {drinks.length} drinks
          </button>
        </div>
      )}
    </section>
  );
}
