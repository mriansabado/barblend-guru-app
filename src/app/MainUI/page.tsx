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
            {Array.isArray(searchResults) && searchResults.slice(0, showAllResults ? undefined : 9).map(drink => (
              <div
                key={drink.idDrink}
                className={`group relative overflow-hidden w-full sm:w-80 lg:w-96 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-800/95 via-gray-700/95 to-gray-800/95 text-white border border-purple-500/40' 
                    : 'bg-gradient-to-br from-white/95 via-pink-50/95 to-white/95 text-gray-900 border border-pink-200/60'
                } rounded-3xl shadow-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-3xl backdrop-blur-sm hover:border-opacity-80`}
                style={{minWidth: '300px', maxWidth: '400px'}}
                onClick={() => handleDrinkClick(drink)}
              >
                {/* Subtle Floral Background Pattern */}
                <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
                  <div className="absolute -top-4 -left-4 w-32 h-32 opacity-40">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50 20C55 20 60 25 60 30C60 35 55 40 50 40C45 40 40 35 40 30C40 25 45 20 50 20Z" fill="currentColor"/>
                      <path d="M70 40C75 40 80 45 80 50C80 55 75 60 70 60C65 60 60 55 60 50C60 45 65 40 70 40Z" fill="currentColor"/>
                      <path d="M30 40C35 40 40 45 40 50C40 55 35 60 30 60C25 60 20 55 20 50C20 45 25 40 30 40Z" fill="currentColor"/>
                      <path d="M50 60C55 60 60 65 60 70C60 75 55 80 50 80C45 80 40 75 40 70C40 65 45 60 50 60Z" fill="currentColor"/>
                      <path d="M70 60C75 60 80 65 80 70C80 75 75 80 70 80C65 80 60 75 60 70C60 65 65 60 70 60Z" fill="currentColor"/>
                      <path d="M30 60C35 60 40 65 40 70C40 75 35 80 30 80C25 80 20 75 20 70C20 65 25 60 30 60Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-30">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50 10C60 10 70 20 70 30C70 40 60 50 50 50C40 50 30 40 30 30C30 20 40 10 50 10Z" fill="currentColor"/>
                      <path d="M80 50C90 50 100 60 100 70C100 80 90 90 80 90C70 90 60 80 60 70C60 60 70 50 80 50Z" fill="currentColor"/>
                      <path d="M20 50C30 50 40 60 40 70C40 80 30 90 20 90C10 90 0 80 0 70C0 60 10 50 20 50Z" fill="currentColor"/>
                      <path d="M50 70C60 70 70 80 70 90C70 100 60 110 50 110C40 110 30 100 30 90C30 80 40 70 50 70Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 opacity-25">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="8" fill="currentColor"/>
                      <circle cx="50" cy="20" r="6" fill="currentColor"/>
                      <circle cx="80" cy="50" r="6" fill="currentColor"/>
                      <circle cx="50" cy="80" r="6" fill="currentColor"/>
                      <circle cx="20" cy="50" r="6" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                
                {/* Card Image Container */}
                <div className="relative overflow-hidden rounded-t-3xl">
                  <img 
                    src={drink.strDrinkThumb} 
                    alt={drink.strDrink} 
                    className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    isDarkMode 
                      ? 'from-gray-900/60 via-transparent to-transparent' 
                      : 'from-white/60 via-transparent to-transparent'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Hover Effect Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                    isDarkMode 
                      ? 'bg-purple-500/90 text-white' 
                      : 'bg-pink-500/90 text-white'
                  } opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0`}>
                    Click to View
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-6 relative z-10">
                  <h3 className="text-xl font-bold text-center mb-3 group-hover:text-purple-400 transition-colors duration-300">
                    {drink.strDrink}
                  </h3>
                  
                  {/* Ingredients Preview */}
                  <div className="space-y-2">
                    {[drink.strIngredient1, drink.strIngredient2, drink.strIngredient3].filter(Boolean).slice(0, 3).map((ingredient, index) => (
                      <div key={index} className="flex items-center text-sm opacity-80">
                        <div className={`mr-3 w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-gradient-to-r from-pink-400 to-purple-400' :
                          index === 1 ? 'bg-gradient-to-r from-cyan-400 to-blue-400' :
                          'bg-gradient-to-r from-yellow-400 to-orange-400'
                        }`}></div>
                        <span className="truncate">{ingredient}</span>
                      </div>
                    ))}
                    {[drink.strIngredient1, drink.strIngredient2, drink.strIngredient3].filter(Boolean).length > 3 && (
                      <div className="text-xs opacity-60 text-center pt-2">
                        +{Object.keys(drink).filter(key => key.startsWith('strIngredient') && drink[key]).length - 3} more ingredients
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Effect Line */}
                  <div className={`absolute bottom-0 left-0 w-0 h-1 ${
                    isDarkMode ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-pink-400 to-purple-400'
                  } transition-all duration-500 group-hover:w-full rounded-b-3xl`} />
                </div>
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
