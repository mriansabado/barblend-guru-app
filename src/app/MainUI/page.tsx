"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MainUI() {
  const [query, setQuery] = useState('');
  const [cocktail, setCocktail] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchRandomSuggestions();
  }, []);

  const fetchCocktail = async (drinkName) => {
    try {
      const response = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkName}`);
      const drinks = response.data.drinks;
      if (drinks) {
        setCocktail(drinks[0]);
        setSuggestions(drinks.slice(1, 5)); // Get up to 4 suggested drinks
        setHasSearched(true);
      } else {
        setCocktail(null);
        fetchRandomSuggestions();
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Error fetching the cocktail:", error);
    }
  };

  const fetchRandomSuggestions = async () => {
    try {
      const drinks = [];
      for (let i = 0; i < 4; i++) {
        const response = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/random.php');
        drinks.push(response.data.drinks[0]);
      }
      setSuggestions(drinks);
    } catch (error) {
      console.error("Error fetching random suggestions:", error);
    }
  };

  const handleSearchClick = () => {
    fetchCocktail(query);
  };

  const handleSuggestionClick = (drinkName) => {
    fetchCocktail(drinkName);
  };

  const handleResetClick = () => {
    setQuery('');
    setCocktail(null);
    setHasSearched(false);
    fetchRandomSuggestions();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">BarBlend Guru</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a cocktail name"
          className="w-full p-4 rounded-lg text-gray-900"
        />
        <button
          onClick={handleSearchClick}
          className="w-full mt-4 p-4 bg-purple-700 rounded-lg hover:bg-purple-800 transition-colors duration-300"
        >
          Search
        </button>
        {hasSearched && (
          <button
            onClick={handleResetClick}
            className="w-full mt-2 p-4 bg-red-700 rounded-lg hover:bg-red-800 transition-colors duration-300"
          >
            Reset to Home
          </button>
        )}
      </div>

      {cocktail && (
        <div className="w-full max-w-4xl mx-auto mt-10 p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">{cocktail.strDrink}</h2>
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <img src={cocktail.strDrinkThumb} alt={cocktail.strDrink} className="w-full md:w-1/2 rounded-lg mb-4 md:mb-0 md:mr-6" />
            <div className="text-gray-900">
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

      <div className="w-full max-w-4xl mx-auto mt-10">
        <h2 className="text-3xl font-bold text-center mb-4">You might also like:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suggestions.map(drink => (
            <div
              key={drink.idDrink}
              className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg cursor-pointer"
              onClick={() => handleSuggestionClick(drink.strDrink)}
            >
              <img src={drink.strDrinkThumb} alt={drink.strDrink} className="w-full rounded-lg mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{drink.strDrink}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
