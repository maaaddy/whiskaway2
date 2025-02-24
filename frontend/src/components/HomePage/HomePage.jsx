import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HomePage({ searchQuery, recipeFilter }) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_KEY = process.env.REACT_APP_API_KEY;

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            console.log('Fetching with filters:', recipeFilter);
    
            try {
                const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
                    params: {
                        apiKey: API_KEY,
                        number: 10,
                        query: searchQuery || '',
                        diet: recipeFilter.diet,
                        type: recipeFilter.type,
                        cuisine: recipeFilter.cuisine,
                        intolerances: recipeFilter.intolerances,
                    },
                });
    
                setRecipes(response.data.results);
            } catch (err) {
                console.error('Error fetching recipes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, [searchQuery, recipeFilter]);
    

    return (
        <div className="homepage back">
            <div className="recipe-list">
                {loading ? (
                    <p>Loading recipes...</p>
                ) : recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <div key={recipe.id} className="recipe-card">
                            <Link to={`/recipe/${recipe.id}`}>
                                <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="recipe-image"
                                />
                                <h3>{recipe.title}</h3>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No recipes found. Try searching for something else!</p>
                )}
            </div>
        </div>
    );
}

export default HomePage;
