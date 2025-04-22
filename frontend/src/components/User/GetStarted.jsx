import React from 'react';
import { useNavigate } from 'react-router-dom';

function GetStarted() {
  const navigate = useNavigate();

  const commonAllergens = [
    { emoji: '🥛', label: 'Dairy-Free' },
    { emoji: '🍳', label: 'Egg-Free' },
    { emoji: '🍞', label: 'Gluten-Free' },
    { emoji: '🥜', label: 'Peanut-Free' },
    { emoji: '🌰', label: 'Tree Nut-Free' },
    { emoji: '🦐', label: 'Shellfish-Free' },
    { emoji: '🌱', label: 'Soy-Free' },
    { emoji: '🌾', label: 'Wheat-Free' }
  ];

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/background_whiskaway.jpg')" }}
    >
      <div className="flex flex-1">
        <div
          className="md:w-2/5 w-full flex flex-col justify-center items-center p-10 text-gray-800 md:ml-10 shadow-2xl relative backdrop-blur-sm bg-white bg-opacity-70"
        >
          <div className="logo">
            <img src="/logo.png" alt="Logo" className="w-28 h-auto pb-4" />
          </div>
          <h1 className="text-6xl font-extrabold mb-6 text-teal-700 drop-shadow-lg relative">
            WhiskAway
          </h1>
          <p className="text-lg text-center mb-28 text-gray-700 drop-shadow-md relative">
            Your place to find, create, and share recipes!
          </p>
          <div className="flex flex-col space-y-4 w-full px-8 relative">
            <span className="text-center text-xl font-extrabold text-teal-700 drop-shadow-lg relative mb-2">
              Get Started
            </span>
            <button
              onClick={() => navigate('/signup')}
              className="w-full px-6 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-transform transform hover:scale-105 duration-300"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-transform transform hover:scale-105 duration-300"
            >
              Log In
            </button>
          </div>
        </div>
        <div className="flex-1"></div>
      </div>
    <p className='text-center text-sm py-2'>Allergies? No worries. Filter through recipes to your needs.</p>
      <div className="h-12 bg-white bg-opacity-80 backdrop-blur-sm border-t flex items-center justify-evenly px-6">
        {commonAllergens.map((a, idx) => (
          <span key={idx} className="text-teal-700 font-semibold text-sm md:text-lg whitespace-nowrap">
            {a.emoji} {a.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default GetStarted;