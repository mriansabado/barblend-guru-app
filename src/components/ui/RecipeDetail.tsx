"use client";

import { BarButton } from "@/components/ui/BarButton";
import { WarmCard } from "@/components/ui/WarmCard";
import { Drink, getDrinkIngredients } from "@/lib/cocktail-api";
import { motion } from "framer-motion";
import { ArrowLeft, GlassWater } from "lucide-react";

interface RecipeDetailProps {
  drink: Drink;
  showBack: boolean;
  onBack: () => void;
}

export function RecipeDetail({ drink, showBack, onBack }: RecipeDetailProps) {
  const ingredients = getDrinkIngredients(drink);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="w-full max-w-5xl"
    >
      <WarmCard className="overflow-hidden p-6 sm:p-10">
        {showBack && (
          <BarButton type="button" variant="soft" className="mb-6 w-auto px-4" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </BarButton>
        )}
        <div className="mb-2 flex items-center justify-center gap-2 text-bar-teal">
          <GlassWater className="h-6 w-6" />
          <span className="text-sm font-bold uppercase tracking-wider">Your recipe</span>
        </div>
        <h2 className="font-display text-center text-4xl font-bold text-white sm:text-5xl">
          {drink.strDrink}
        </h2>
        <div className="mt-10 flex flex-col gap-10 lg:flex-row">
          <motion.img
            initial={{ rotate: -2 }}
            animate={{ rotate: 0 }}
            src={drink.strDrinkThumb}
            alt=""
            className="mx-auto max-h-[380px] w-full max-w-md rounded-3xl border-4 border-white/20 object-cover shadow-2xl lg:mx-0"
          />
          <div className="flex-1 space-y-8">
            <div>
              <h3 className="font-display mb-4 text-2xl font-bold text-bar-mango">Grab this</h3>
              <ul className="flex flex-wrap gap-2">
                {ingredients.map((ing, i) => (
                  <li
                    key={ing}
                    className="rounded-2xl px-4 py-2 text-sm font-semibold text-bar-plum"
                    style={{
                      background:
                        i % 3 === 0
                          ? "#ffb347"
                          : i % 3 === 1
                            ? "#2dd4bf"
                            : "#f472b6",
                    }}
                  >
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            {drink.strInstructions && (
              <div>
                <h3 className="font-display mb-4 text-2xl font-bold text-bar-mango">How to mix it</h3>
                <p className="max-w-prose text-lg leading-relaxed text-white/90">
                  {drink.strInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </WarmCard>
    </motion.div>
  );
}
