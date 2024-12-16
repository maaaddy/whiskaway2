import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BottomNav from '../BottomNav/BottomNav';

function HomePage() {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/recipes')
            .then(response => setRecipes(response.data))
            .catch(err => console.error('Error fetching recipes:', err));
    }, []);

    return (
        <div className="home-page">
            <header>
                <h1>Welcome to Whisk Away</h1>
                <p>Browse through a variety of recipes and get inspired!</p>
            </header>
            
            <div className="recipe-list">
                {recipes.length === 0 ? (
                    <p>No recipes available</p>
                ) : (
                    recipes.map(recipe => (
                        <div key={recipe._id} className="recipe-card">
                            <h2>{recipe.title}</h2>
                            <img src={recipe.image} alt={recipe.title} />
                            <p>Ingredients: {recipe.ingredients.join(', ')}</p>
                            <p>{recipe.instructions}</p>
                        </div>
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    );
}

export default HomePage;
