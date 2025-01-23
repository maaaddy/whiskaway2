import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function RecipeDetailPage() {
    const [recipe, setRecipe] = useState(null);
    const [nutrition, setNutrition] = useState(null);
    const { id } = useParams(); 

    const API_KEY = 'bbed8c1e97b747cc8467631cd9c308b2';

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            try {
                const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
                    params: {
                        apiKey: API_KEY,
                    },
                });
                setRecipe(response.data);
            } 
            
            catch (err) {
                console.error('Error fetching recipe details:', err);
            }
        };

        const fetchNutritionData = async () => {
            try {
                const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/nutritionWidget.json`, {
                    params: {
                        apiKey: API_KEY,
                    },
                });
                setNutrition(response.data);
            } 
            
            catch (err) {
                console.error('Error fetching nutrition data:', err);
            }
        };

        fetchRecipeDetails();
        fetchNutritionData();
    }, [id]);

    if (!recipe) return <p>Loading...</p>;

    return (
        <div className="recipe-detail-page max-w-4xl mx-auto p-6 pb-24">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">{recipe.title}</h2>

            <img src={recipe.image} alt={recipe.title} className="w-full h-72 object-cover rounded-lg mb-6 shadow-lg" />

            <div className="ingredients-card bg-white p-6 rounded-xl shadow-lg mb-6">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Ingredients:</h3>
                <ul className="list-none space-y-3">
                    {recipe.extendedIngredients.map((ingredient) => (
                        <li key={ingredient.id} className="flex justify-between text-lg text-gray-600">
                            <span className="font-bold">{ingredient.original}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="instructions mb-6">
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">Instructions:</h3>
                <p className="text-lg text-gray-600">{recipe.instructions}</p>
            </div>

            {nutrition ? (
                <div className="nutrition bg-gray-100 p-4 rounded-lg mt-6">
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Nutrition:</h3>
                    <ul className="space-y-2 text-lg text-gray-600">
                        <li>Calories: {nutrition.calories}kcal</li>
                        <li>Carbs: {nutrition.carbs}</li>
                        <li>Protein: {nutrition.protein}</li>
                        <li>Fat: {nutrition.fat}</li>
                    </ul>
                </div>
            ) : (
                <p className="text-lg text-gray-600 mt-4">No nutrition information available.</p>
            )}
        </div>
    );
}

export default RecipeDetailPage;
