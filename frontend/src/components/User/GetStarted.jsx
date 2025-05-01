import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar2 from '../TopBar2/TopBar2';

function GetStarted() {
  const navigate = useNavigate();
  const commonAllergens = [
    { label: 'Vegan' },
    { label: 'Shellfish-Free' },
    { label: 'American Dishes' },
    { label: 'Desserts' },
    { label: 'Peanut-Free' },
    { label: 'Keto-Friendly' },
    { label: 'Side Dish' },
    { label: 'Gluten-Free' }
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#e4f1f0]">
      <TopBar2 />

      <div className="flex flex-1 flex-col md:flex-row pt-4 px-6">
        <div className="md:w-2/5 w-full p-6 flex flex-col justify-center px-18 pt-20 sm:pt-16 md:pt-12 lg:pt-8">
          <h1 className="text-4xl font-bold font-serif mb-4 text-teal-700">
            WhiskAway - a Social Recipe Finding Platform
          </h1>
          <p className="text-lg text-left mb-4 text-gray-700">
            Recipe finding made easy. Discover, save, and share recipes with friends. Filter through recipes to your needs.
            Create custom collaborative cookbooks, upload and browse recipes, and make friends along the way.
          </p>
        </div>

        <div className="hidden md:block flex-shrink-0 pr-8 pt-20 ml-auto">
          <div className="hidden md:flex lg:hidden">
            <img
              src="/cookbook.jpg"
              alt="Delicious recipes"
              className="w-96 h-96 object-cover rounded-lg flex-shrink-0"
            />
          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <img
                src="/salad.jpg"
                alt="Dish sample"
                className="w-80 h-64 object-cover rounded-lg flex-shrink-0"
              />
              <img
                src="/cookbook.jpg"
                alt="Cookbook"
                className="w-80 h-64 object-cover rounded-lg flex-shrink-0"
              />
            </div>
            <img
              src="/recipes.jpg"
              alt="Recipe Searching"
              className="w-full h-64 object-cover object-top rounded-lg flex-shrink-0"
            />
          </div>
        </div>
      </div>


      <div className="justify-center text-center py-2">
        <p className="text-md font-thin text-teal-900">
          Allergies? Dieting? No problem. Filter through recipes by type.
        </p>
      </div>
      
      <div className="bg-white bg-opacity-80 backdrop-blur-sm border-t flex flex-wrap items-center justify-center px-6 sm:px-8 md:px-10 lg:px-12 py-4 gap-2">
        {commonAllergens.map((a, idx) => (
          <span
            key={idx}
            className={
              `text-teal-700 font-thin text-sm whitespace-nowrap px-2 ${
                idx > 4 ? 'hidden sm:inline-block' : ''
              }`
            }
          >
            {a.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default GetStarted;