import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import { useParams, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const axiosInstance = axiosRateLimit(axios.create(), { maxRequests: 5, perMilliseconds: 1000 });

function CookbookDetailPage() {
  const { id } = useParams();
  const [cookbook, setCookbook] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const API_KEY = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    const fetchCookbook = async () => {
      const cached = localStorage.getItem(`cookbook_${id}`);

      if (cached) {
        const { timestamp, cookbook, recipes } = JSON.parse(cached);
        const isFresh = Date.now() - timestamp < 1000 * 60 * 10;
        if (isFresh) {
          setCookbook(cookbook);
          setRecipes(recipes);
          setLoading(false);
          return;
        }
      }
      try {
        const response = await axios.get(`/api/cookbook/${id}`);
        setCookbook(response.data);

        const profileRes = await axios.get('/api/profile');
        setIsOwner(response.data.owner?.toString() === profileRes.data.userId?.toString());

        const allRecipes = await Promise.all(
          response.data.recipes.map(async (recipeId) => {
            const isUserRecipe = /^[a-f\d]{24}$/i.test(recipeId);
                      
            if (isUserRecipe) {
              try {
                const res = await axios.get(`/api/recipes/${recipeId}`);
                return {
                  ...res.data,
                  id: recipeId,
                  isUser: true,
                };
              } catch (err) {
                console.error("Failed to load user recipe", err);
                return null;
              }
            } else {
              try {
                const res = await axiosInstance.get(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`);
                return res.data;
                } catch (err) {
                  console.error("Failed to load API recipe", err);
                  return null;
                }
            }
          })
        );                  

        const cleanRecipes = allRecipes.filter(Boolean);
        setRecipes(cleanRecipes.filter(Boolean));

        localStorage.setItem(`cookbook_${id}`, JSON.stringify({
          timestamp: Date.now(),
          cookbook: response.data,
          recipes: cleanRecipes,
        }));

      } catch (err) {
        console.error("Error fetching cookbook:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCookbook();
  }, [id, API_KEY]);

  const handleRemoveRecipe = async (idToRemove) => {
    const confirmed = window.confirm('Are you sure you want to remove this recipe?');
    if (!confirmed) return;

    try {
      await axios.delete(`/api/cookbook/${id}/removeRecipe/${idToRemove}`);
      localStorage.removeItem(`cookbook_${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== idToRemove));
      toast.success('Recipe removed');
    } catch (err) {
      toast.error('Failed to remove recipe');
    }
  };      

  return (
    <div className="back max-w-6xl mx-auto p-6 pb-20">
      <Toaster position='top-right' />
      {loading ? (
        <p className="text-center text-lg text-gray-600 mt-20">Loading your cookbook...</p>
        ) : (
        <>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{cookbook.title}</h1>
          <p className="text-gray-500 text-lg">{recipes.length} Recipes</p>
        </div>
        {cookbook.recipes.length === 0 ? (
          <div className="text-center mt-8">
          <p className="text-gray-600 text-lg mb-2">This cookbook doesn't have any recipes yet.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
            Browse Recipes
          </Link>
          </div>
        ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.length > 0 ? (
            recipes.map((recipe) => {
              if (!recipe || !recipe.title) return null;
              return (
                <div key={recipe.id} className="relative group">
                <Link to={`/recipe/${recipe.id}`} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden block">
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={recipe.isUser ? `data:image/jpeg;base64,${recipe.image}` : recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {recipe.readyInMinutes !== undefined
                        ? `${recipe.readyInMinutes} min`
                        : recipe.prepTime || recipe.cookTime
                        ? `${recipe.prepTime + recipe.cookTime} min`
                        : "No time info"}{" "}
                      |{" "}
                      {recipe.servings ? `Serves ${recipe.servings}` : "No servings info"}
                    </p>
                  </div>
                </Link>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveRecipe(recipe.id)}
                    className="absolute top-2 right-2 bg-white/80 text-gray-500 hover:text-red-600 p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition"
                    title="Remove from cookbook"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 36 36">
                      <path d="M6,9V31a2.93,2.93,0,0,0,2.86,3H27.09A2.93,2.93,0,0,0,30,31V9Zm9,20H13V14h2Zm8,0H21V14h2Z"></path>
                      <path d="M30.73,5H23V4A2,2,0,0,0,21,2h-6.2A2,2,0,0,0,13,4V5H5A1,1,0,1,0,5,7H30.73a1,1,0,0,0,0-2Z"></path>
                      <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
                    </svg>
                  </button>
                )}
                </div>
              );
            }
          )
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                No visible recipes in this cookbook.
              </p>
            )}
        </div>
        )}
          </>
        )}
    </div>
  );
}

export default CookbookDetailPage;