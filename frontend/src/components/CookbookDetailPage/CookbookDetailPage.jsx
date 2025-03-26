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
            try {
                const response = await axios.get(`/cookbook/${id}`);
                setCookbook(response.data);

                const initialRecipePromises = response.data.recipes.slice(0, 5).map((recipeId) =>
                    axiosInstance.get(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`)
                        .then(res => res.data)
                        .catch(error => {
                            console.error(`Error fetching recipe ${recipeId}:`, error);
                            return null;
                        })
                );

                const initialRecipes = await Promise.all(initialRecipePromises);
                const uniqueInitialRecipes = initialRecipes.filter(recipe => recipe !== null);

                setRecipes(prevRecipes => {
                    const allRecipes = [...prevRecipes, ...uniqueInitialRecipes];
                    return Array.from(new Set(allRecipes.map(a => a.id))).map(id => {
                        return allRecipes.find(a => a.id === id);
                    });
                });

                const remainingRecipePromises = response.data.recipes.slice(5).map((recipeId) =>
                    axiosInstance.get(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`)
                        .then(res => res.data)
                        .catch(error => {
                            console.error(`Error fetching recipe ${recipeId}:`, error);
                            return null;
                        })
                );

                const remainingRecipes = await Promise.all(remainingRecipePromises);
                const uniqueRemainingRecipes = remainingRecipes.filter(recipe => recipe !== null);

                setRecipes(prevRecipes => {
                    const allRecipes = [...prevRecipes, ...uniqueRemainingRecipes];
                    return Array.from(new Set(allRecipes.map(a => a.id))).map(id => {
                        return allRecipes.find(a => a.id === id);
                    });
                });
            } catch (err) {
                console.error('Error fetching cookbook:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCookbook();
    }, [id, API_KEY]);

    return (
        <div className="recipe-list back">
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {cookbook.recipes.length === 0 ? (
                        <div className="text-center mt-8 back">
                            <p className="text-gray-600 text-lg mb-2">
                                There are no recipes in this cookbook.
                            </p>
                            <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
                                Browse for recipes
                            </Link>
                        </div>
                        ) : (
                        recipes.map((recipe) => (
                            <div key={recipe.id} className="recipe-card mb-6">
                            <Link to={`/recipe/${recipe.id}`}>
                                <h3 className="text-lg font-medium">{recipe.title}</h3>
                            </Link>
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                style={{ width: '200px', borderRadius: '10px' }}
                                className="mt-2"
                            />
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}

export default CookbookDetailPage;