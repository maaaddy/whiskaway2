import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function CookbookDetailPage() {
    const { id } = useParams();
    const [cookbook, setCookbook] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const API_KEY = process.env.REACT_APP_API_KEY;

    useEffect(() => {
        const fetchCookbook = async () => {
            try {
                const response = await axios.get(`/cookbook/${id}`);
                setCookbook(response.data);

                const recipeDetails = await Promise.all(
                    response.data.recipes.map(recipeId =>
                        axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`)
                            .then(res => res.data)
                            .catch(() => null)
                    )
                );
                setRecipes(recipeDetails.filter(recipe => recipe !== null));
            } catch (err) {
                console.error('Error fetching cookbook:', err);
            }
        };
        fetchCookbook();
    }, [id, API_KEY]);

    return (
        <div className="recipe-list pt-20">
            <h1>{cookbook?.title}</h1>
            <h2>Recipes</h2>
            {recipes.length > 0 ? (
                recipes.map((recipe) => (
                    <div key={recipe.id} className="recipe-card">
                        <Link to={`/recipe/${recipe.id}`}>
                            <h3>{recipe.title}</h3>
                        </Link>
                        <img src={recipe.image} alt={recipe.title} style={{ width: '200px', borderRadius: '10px' }} />
                        <p>{recipe.instructions.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</p>
                    </div>
                ))
            ) : (
                <p>No recipes added yet.</p>
            )}
        </div>
    );
}

export default CookbookDetailPage;