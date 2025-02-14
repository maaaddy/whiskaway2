import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HomePage({ searchQuery }) {
    const [recipes, setRecipes] = useState([]);
    const API_KEY = 'bbed8c1e97b747cc8467631cd9c308b2';

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
                    params: {
                        apiKey: API_KEY,
                        number: 10,
                        query: searchQuery,
                    },
                });
                setRecipes(response.data.results);
            } catch (err) {
                console.error('Error fetching recipes:', err);
            }
        };

        fetchRecipes();
    }, [searchQuery]);

    return (
        <div className="homepage back">
            <div className="recipe-list">
                {recipes.length > 0 ? (
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
