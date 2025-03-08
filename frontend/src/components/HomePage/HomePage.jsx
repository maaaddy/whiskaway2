import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HomePage({ searchQuery, recipeFilter }) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const API_KEY = process.env.REACT_APP_API_KEY;

    useEffect(() => {
        const savedScrollPos = sessionStorage.getItem('scrollPosition');
        if (savedScrollPos) {
            window.scrollTo(0, parseInt(savedScrollPos, 10));
        }

        return () => {
            sessionStorage.setItem('scrollPosition', window.scrollY);
        };
    }, []);

    useEffect(() => {
        setRecipes([]);
        setPage(1);
        setHasMore(true);
    }, [searchQuery, recipeFilter]);

    useEffect(() => {
        const cacheKey = `recipes-${searchQuery}-${JSON.stringify(recipeFilter)}-page-${page}`;
        const cachedRecipes = sessionStorage.getItem(cacheKey);

        if (cachedRecipes) {
            setRecipes((prev) => [...prev, ...JSON.parse(cachedRecipes)]);
            return;
        }

        const fetchRecipes = async () => {
            setLoading(true);
            try {
                const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
                    params: {
                        apiKey: API_KEY,
                        number: 24,
                        offset: (page - 1) * 24,
                        query: searchQuery || '',
                        diet: recipeFilter.diet,
                        type: recipeFilter.type,
                        cuisine: recipeFilter.cuisine,
                        intolerances: recipeFilter.intolerances,
                    },
                });

                if (response.data.results.length === 0) {
                    setHasMore(false);
                } else {
                    setRecipes((prev) => [...prev, ...response.data.results]);
                    sessionStorage.setItem(cacheKey, JSON.stringify(response.data.results));
                }
            } catch (err) {
                console.error('Error fetching recipes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, [page, searchQuery, recipeFilter]);

    const handleScroll = useCallback(() => {
        if (!hasMore || loading) return;

        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = window.innerHeight;

        if (scrollHeight - scrollTop <= clientHeight + 100) {
            setPage((prev) => prev + 1);
        }
    }, [hasMore, loading]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className="homepage back">
            <div className="recipe-list">
                {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <div key={recipe.id} className="hovering group">
                            <div className="recipe-card">
                                <Link to={`/recipe/${recipe.id}`}>
                                    <div className="relative">
                                        <img
                                            src={recipe.image}
                                            alt={recipe.title}
                                            className="recipe-image w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gray-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl"></div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-2xl">
                                            <h3 className="text-white text-xl font-bold text-center">{recipe.title}</h3>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No recipes found. Try searching for something else!</p>
                )}
            </div>
            {loading && <p className="text-center mx-auto pt-4 text-teal-700 font-semibold">Loading more recipes...</p>}
        </div>
    );
}

export default HomePage;