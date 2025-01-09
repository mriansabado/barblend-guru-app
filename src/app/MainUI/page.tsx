"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Drink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  [key: string]: any;
}

export default function MainUI() {
  const [query, setQuery] = useState<string>('');
  const [cocktail, setCocktail] = useState<Drink | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [searchType, setSearchType] = useState<'name' | 'ingredient'>('name');
  const [searchResults, setSearchResults] = useState<Drink[]>([]);
  const [showAllResults, setShowAllResults] = useState<boolean>(false);

  const fetchCocktail = async (drinkName: string) => {
    try {
      const response = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkName}`);
      const drinks: Drink[] = response.data.drinks;
      if (drinks) {
        setSearchResults(drinks);
        setCocktail(null);
        setHasSearched(true);
      } else {
        setSearchResults([]);
        setCocktail(null);
        fetchRandomCocktail();
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Error fetching the cocktail:", error);
    }
  };

  const fetchRandomCocktail = async () => {
    try {
      const response = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/random.php');
      const drink: Drink = response.data.drinks[0];
      setCocktail(drink);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching a random cocktail:", error);
    }
  };

  const fetchByIngredient = async (ingredient: string) => {
    try {
      const response = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`);
      const drinks: Drink[] = response.data.drinks;
      if (drinks && drinks.length > 0) {
        const detailedDrinks = await Promise.all(
          drinks.slice(0, 10).map(async (drink) => {
            try {
              const detailResponse = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`);
              return detailResponse.data.drinks[0];
            } catch (error) {
              console.error(`Error fetching details for drink ${drink.idDrink}:`, error);
              return null;
            }
          })
        );
        
        const validDrinks = detailedDrinks.filter(drink => drink !== null);
        setSearchResults(validDrinks);
        setCocktail(null);
        setHasSearched(true);
      } else {
        setSearchResults([]);
        setCocktail(null);
        setHasSearched(true);
        alert("No drinks found with that ingredient!");
      }
    } catch (error) {
      console.error("Error fetching by ingredient:", error);
      alert("Error searching for drinks. Please try again.");
    }
  };

  const handleSearchClick = () => {
    if (searchType === 'name') {
      fetchCocktail(query);
    } else {
      fetchByIngredient(query);
    }
  };

  const handleResetClick = () => {
    setQuery('');
    setCocktail(null);
    setHasSearched(false);
    setSearchResults([]);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleClearInput = () => {
    setQuery('');
  };

  const handleDrinkClick = (drink: Drink) => {
    setCocktail(drink);
  };

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-zinc-800 via-stone-900 to-neutral-950 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-gray-900'
    } flex flex-col items-center justify-center p-4`}>
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <a href="/"><h1 className="text-4xl font-bold text-center">BarBlend Guru</h1></a>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-opacity-20 bg-white hover:bg-opacity-30 transition-all ml-4"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
        <div className="flex items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'name' ? "Enter a cocktail name" : "Enter an ingredient (e.g., Vodka, Gin)"}
              className={`w-full p-4 rounded-lg pr-10 ${
                isDarkMode 
                  ? 'text-white bg-gray-800' 
                  : 'text-white-900 bg-white'
              }`}
            />
            {query && (
              <button
                onClick={handleClearInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          {hasSearched && (
            <button
              onClick={handleResetClick}
              className="ml-2 p-2 bg-red-700 rounded-lg hover:bg-red-800 transition-colors duration-300"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setSearchType('name')}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
              searchType === 'name'
                ? (isDarkMode ? 'bg-indigo-600' : 'bg-indigo-500')
                : 'bg-gray-500'
            }`}
          >
            Search by Name
          </button>
          <button
            onClick={() => setSearchType('ingredient')}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
              searchType === 'ingredient'
                ? (isDarkMode ? 'bg-indigo-600' : 'bg-indigo-500')
                : 'bg-gray-500'
            }`}
          >
            Search by Ingredient
          </button>
        </div>
        <button
          onClick={handleSearchClick}
          className={`w-full mt-4 p-4 rounded-lg transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          Search
        </button>
        <button
          onClick={fetchRandomCocktail}
          className={`w-full mt-2 p-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          } transform hover:scale-102 hover:shadow-lg`}
        >
          <span>Find a Random Drink</span>
          <span className="text-xl" role="img" aria-label="dice">🎲</span>
        </button>
      </div>

      {searchResults.length > 0 && !cocktail && (
        <div className="w-full max-w-4xl mx-auto mt-10">
          <h2 className="text-3xl font-bold text-center mb-4">Search Results:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.slice(0, showAllResults ? undefined : 6).map(drink => (
              <div
                key={drink.idDrink}
                className={`${
                  isDarkMode 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-white text-gray-900'
                } p-4 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => handleDrinkClick(drink)}
              >
                <img src={drink.strDrinkThumb} alt={drink.strDrink} 
                  className="w-full rounded-lg mb-2" />
                <h3 className="text-xl font-bold">{drink.strDrink}</h3>
              </div>
            ))}
          </div>
          {searchResults.length > 6 && !showAllResults && (
            <button
              onClick={() => setShowAllResults(true)}
              className={`mt-6 mx-auto block px-6 py-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
            >
              Show More Results ({searchResults.length - 6} more)
            </button>
          )}
        </div>
      )}

      {cocktail && (
        <div className={`w-full max-w-4xl mx-auto mt-10 p-6 rounded-lg shadow-lg ${
          isDarkMode 
            ? 'bg-gray-800 text-white' 
            : 'bg-white text-gray-900'
        }`}>
          <h2 className={`text-3xl font-bold text-center mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{cocktail.strDrink}</h2>
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <img src={cocktail.strDrinkThumb} alt={cocktail.strDrink} 
              className="w-full md:w-1/2 rounded-lg mb-4 md:mb-0 md:mr-6" />
            <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              <h3 className="text-2xl font-bold mb-2">Ingredients:</h3>
              <ul className="list-disc list-inside">
                {Object.keys(cocktail).filter(key => key.startsWith('strIngredient') && cocktail[key]).map(key => (
                  <li key={key}>{cocktail[key]}</li>
                ))}
              </ul>
              <h3 className="text-2xl font-bold mt-4 mb-2">Instructions:</h3>
              <p>{cocktail.strInstructions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
