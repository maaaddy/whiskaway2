import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import { useParams, Link } from 'react-router-dom';

const axiosInstance = axiosRateLimit(axios.create(), { maxRequests: 5, perMilliseconds: 1000 });

function CookbookDetailPage() {
    const { id } = useParams();
    const [cookbook, setCookbook] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_KEY = process.env.REACT_APP_API_KEY;

    useEffect(() => {
        const fetchCookbook = async () => {
            const cachedData = localStorage.getItem(`cookbook_${id}`);

            if (cachedData) {
                const { cookbook: cachedCookbook, recipes: cachedRecipes } = JSON.parse(cachedData);
                setCookbook(cachedCookbook);
                setRecipes(cachedRecipes);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/api/cookbook/${id}`);
                setCookbook(response.data);

                const allRecipes = await Promise.all(
                    response.data.recipes.map((recipeId) =>                
                        axiosInstance
                            .get(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`)
                            .then(res => res.data)
                            .catch(() => null)
                    )
                );

                const cleanRecipes = allRecipes.filter(Boolean);

                setRecipes(cleanRecipes);

                localStorage.setItem(`cookbook_${id}`, JSON.stringify({
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

    return (
        <div className="back max-w-6xl mx-auto p-6 pb-20">
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
                            {recipes.map((recipe) => (
                                <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden group">
                                    <div className="h-48 w-full overflow-hidden">
                                        <img
                                            src={recipe.image}
                                            alt={recipe.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                                            {recipe.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {recipe.readyInMinutes} min | Serves {recipe.servings}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CookbookDetailPage;