"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../globals.css';

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

  const searchResultsRef = useRef<HTMLDivElement>(null);
  const cocktailDetailsRef = useRef<HTMLDivElement>(null);

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
      setSearchResults([]);
      setCocktail(null);
      setHasSearched(true);
    }
  };

  const fetchRandomCocktail = async () => {
    try {
      const response = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/random.php');
      const drink: Drink = response.data.drinks[0];
      setCocktail(drink);
      setSearchResults([]);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching a random cocktail:", error);
      setSearchResults([]);
      setCocktail(null);
      setHasSearched(true);
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
      setSearchResults([]);
      setCocktail(null);
      setHasSearched(true);
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

  useEffect(() => {
    if (searchResultsRef.current && hasSearched && searchResults.length > 0 && !cocktail) {
      searchResultsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (cocktailDetailsRef.current && hasSearched && cocktail) {
      cocktailDetailsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hasSearched, searchResults.length, cocktail]);

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white' 
        : 'bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 text-gray-900'
    } flex flex-col items-center justify-center p-8`}>
      
      {/* Theme Toggle - Fixed Position */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full text-xl sm:text-2xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center ${
          isDarkMode 
            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500' 
            : 'bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500'
        } shadow-lg hover:shadow-xl`}
      >
        {isDarkMode ? '🌞' : '🌙'}
      </button>
      
      {/* Main Container */}
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <a href="/">
            <h1 className={`text-6xl font-black mb-4 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent'
            }`}>
              BarBlend Guru
            </h1>
          </a>
          <p className={`text-xl ${
            isDarkMode ? 'text-purple-200' : 'text-gray-600'
          }`}>
            Discover your next favorite cocktail! 🍹
          </p>
        </div>

        {/* Search Form */}
        <div className={`p-8 rounded-3xl shadow-2xl mb-8 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-purple-500/30' 
            : 'bg-gradient-to-br from-white/80 to-pink-50/80 backdrop-blur-sm border border-pink-200'
        }`}>
          
          {/* Search Type Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setSearchType('name')}
              className={`flex-1 py-4 px-4 sm:px-6 rounded-2xl text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                searchType === 'name'
                  ? (isDarkMode 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg')
                  : (isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
              }`}
            >
              🍸 Search by Name
            </button>
            <button
              onClick={() => setSearchType('ingredient')}
              className={`flex-1 py-4 px-4 sm:px-6 rounded-2xl text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                searchType === 'ingredient'
                  ? (isDarkMode 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg')
                  : (isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
              }`}
            >
              🥃 Search by Ingredient
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'name' ? "🍹 Enter a cocktail name..." : "🥃 Enter an ingredient (e.g., Vodka, Gin)..."}
              className={`w-full p-6 text-xl rounded-2xl pr-16 transition-all duration-300 focus:outline-none focus:ring-4 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500/50' 
                  : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-pink-500/50'
              } shadow-lg`}
            />
            {query && (
              <button
                onClick={handleClearInput}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleSearchClick}
              className={`w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600' 
                  : 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500'
              } text-white`}
            >
              🔍 Search Cocktails
            </button>
            
            <button
              onClick={fetchRandomCocktail}
              className={`w-full py-6 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500' 
                  : 'bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400'
              } text-white`}
            >
              <span>🎲 Surprise Me!</span>
              <span className="text-2xl">🍹</span>
            </button>

            {hasSearched && (
              <button
                onClick={handleResetClick}
                className="w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🔄 Reset Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && !cocktail && (
        <div ref={searchResultsRef} className="w-full max-w-7xl mx-auto px-4">
          <h2 className={`text-4xl font-bold text-center mb-12 ${
            isDarkMode ? 'text-purple-200' : 'text-gray-800'
          }`}>
            🎉 Found {searchResults.length} Cocktails!
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mb-12" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem'}}>
            {Array.isArray(searchResults) && searchResults.slice(0, showAllResults ? undefined : 9).map((drink, index) => (
              <div
                key={drink.idDrink}
                className={`group relative overflow-hidden w-full sm:w-80 lg:w-96 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/95 via-purple-900/95 to-indigo-900/95 text-white border-2 border-purple-400/50' 
                    : 'bg-gradient-to-br from-rose-50/95 via-pink-100/95 to-purple-100/95 text-gray-900 border-2 border-pink-300/60'
                } rounded-3xl shadow-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-3xl backdrop-blur-sm hover:border-opacity-100`}
                style={{minWidth: '300px', maxWidth: '400px'}}
                onClick={() => handleDrinkClick(drink)}
              >
                {/* Fun Background Pattern with Drink Icons */}
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                  <div className="absolute -top-4 -left-4 w-32 h-32 opacity-30 text-purple-400">
                    🍸
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-25 text-pink-400">
                    🥃
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 opacity-20 text-cyan-400">
                    🍹
                  </div>
                  <div className="absolute top-8 right-8 w-16 h-16 opacity-20 text-yellow-400">
                    ✨
                  </div>
                </div>
                
                {/* Card Image Container with Enhanced Styling */}
                <div className="relative overflow-hidden rounded-t-3xl">
                  <img 
                    src={drink.strDrinkThumb} 
                    alt={drink.strDrink} 
                    className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  
                  {/* Enhanced Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    isDarkMode 
                      ? 'from-purple-900/70 via-purple-600/20 to-transparent' 
                      : 'from-pink-900/70 via-pink-600/20 to-transparent'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Fun Hover Effect Badge */}
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  } opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 border-2 border-white/20`}>
                    🎯 Click to View
                  </div>
                  
                  {/* Drink Type Indicator */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                  } shadow-lg border border-white/20`}>
                    🍹 Cocktail
                  </div>
                </div>
                
                {/* Enhanced Card Content */}
                <div className="p-6 relative z-10">
                  {/* Drink Name with Enhanced Typography */}
                  <h3 className="text-2xl font-black text-center mb-4 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-500 ${
                    isDarkMode 
                      ? 'group-hover:bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400' 
                      : 'group-hover:bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500'
                  }">
                    {drink.strDrink}
                  </h3>
                  
                  {/* Fun Ingredients Preview with Enhanced Styling */}
                  <div className="space-y-3 mb-4">
                    <div className="text-sm font-semibold text-center mb-3 opacity-80">
                      🎨 Key Ingredients:
                    </div>
                    {[drink.strIngredient1, drink.strIngredient2, drink.strIngredient3].filter(Boolean).slice(0, 3).map((ingredient, index) => (
                      <div key={index} className="flex items-center text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        <div className={`mr-3 w-3 h-3 rounded-full shadow-sm ${
                          index === 0 ? 'bg-gradient-to-r from-pink-400 to-rose-500' :
                          index === 1 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' :
                          'bg-gradient-to-r from-yellow-400 to-orange-500'
                        }`}></div>
                        <span className="truncate font-medium">{ingredient}</span>
                      </div>
                    ))}
                    {[drink.strIngredient1, drink.strIngredient2, drink.strIngredient3].filter(Boolean).length > 3 && (
                      <div className="text-xs opacity-70 text-center pt-2 font-medium">
                        ✨ +{Object.keys(drink).filter(key => key.startsWith('strIngredient') && drink[key]).length - 3} more ingredients
                      </div>
                    )}
                  </div>
                  
                  {/* Fun Action Indicator */}
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-400/30' 
                        : 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-600 border border-pink-400/30'
                    } transition-all duration-300 group-hover:scale-105`}>
                      <span className="mr-2">🎯</span>
                      Tap to see full recipe!
                    </div>
                  </div>
                  
                  {/* Enhanced Hover Effect Line */}
                  <div className={`absolute bottom-0 left-0 w-0 h-2 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400' 
                      : 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
                  } transition-all duration-700 group-hover:w-full rounded-b-3xl shadow-lg`} />
                </div>
                
                {/* Fun Corner Accent */}
                <div className={`absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] ${
                  isDarkMode 
                    ? 'border-t-purple-500/30' 
                    : 'border-t-pink-400/30'
                } opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
              </div>
            ))}
          </div>
          {searchResults.length > 9 && !showAllResults && (
            <div className="text-center">
              <button
                onClick={() => setShowAllResults(true)}
                className={`px-10 py-5 text-xl font-bold rounded-3xl transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700' 
                    : 'bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 hover:from-purple-500 hover:via-pink-500 hover:to-purple-600'
                } text-white border-2 border-transparent hover:border-white/20`}
              >
                🎯 Show All {searchResults.length} Results
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cocktail Details */}
      {cocktail && (
        <div ref={cocktailDetailsRef} className={`w-full max-w-5xl mx-auto p-8 rounded-3xl shadow-2xl ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-white border border-purple-500/30' 
            : 'bg-gradient-to-br from-white/90 to-pink-50/90 text-gray-900 border border-pink-200'
        } backdrop-blur-sm`}>
          <h2 className={`text-5xl font-black text-center mb-8 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent'
          }`}>
            {cocktail.strDrink} 🍹
          </h2>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            <img src={cocktail.strDrinkThumb} alt={cocktail.strDrink} 
              className="w-full lg:w-1/2 h-96 object-cover rounded-3xl shadow-2xl" />
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-3xl font-bold mb-4 flex items-center">
                  🥃 Ingredients:
                </h3>
                <ul className="space-y-2">
                  {Object.keys(cocktail).filter(key => key.startsWith('strIngredient') && cocktail[key]).map(key => (
                    <li key={key} className="text-xl flex items-center">
                      <span className="mr-3">✨</span>
                      {cocktail[key]}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-4 flex items-center">
                  📝 Instructions:
                </h3>
                <p className="text-xl leading-relaxed">{cocktail.strInstructions}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
