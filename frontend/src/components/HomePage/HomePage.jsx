import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SkeletonCard = ({ delay = 0 }) => (
  <div className="hovering group">
    <div
      className="recipe-card animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-full h-48 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>
);

function HomePage({ searchQuery, recipeFilter }) {
  const [spoonacularRecipes, setSpoonacularRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [filteredUserRecipes, setFilteredUserRecipes] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const API_KEY = process.env.REACT_APP_API_KEY;

  const isFiltered = () => {
    if (searchQuery) return true;
    const { type, cuisine, diet, intolerances } = recipeFilter;
    return !!(type || cuisine || diet || intolerances);
  };

  const applyUserFilters = recipes => recipes.filter(r => {
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    const { type, cuisine, diet, intolerances } = recipeFilter;
    if (type && !r.mealType.some(t => type.split(',').includes(t))) return false;
    if (cuisine && !r.cuisine.some(c => cuisine.split(',').includes(c))) return false;
    if (diet && !r.diet.some(d => diet.split(',').includes(d))) return false;
    if (intolerances && !r.intolerance.some(i => intolerances.split(',').includes(i))) return false;
    return true;
  });

  useEffect(() => {
    setUserLoading(true);
    axios.get('/api/public-recipes', { withCredentials: false, headers: { 'Accept': 'application/json' } })
      .then(res => {
        setUserRecipes(res.data);
        setFilteredUserRecipes(applyUserFilters(res.data));
      })
      .catch(err => console.error('Error fetching public recipes:', err))
      .finally(() => setUserLoading(false));

    setSpoonacularRecipes([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery, recipeFilter]);

  useEffect(() => {
    if (userLoading) return;
    setApiLoading(true);

    const fetchAPI = async () => {
      try {
        let results = [];
        if (!isFiltered() || page === 1) {
          const tags = [];
          if (recipeFilter.type) tags.push(...recipeFilter.type.split(','));
          if (recipeFilter.cuisine) tags.push(...recipeFilter.cuisine.split(','));
          if (recipeFilter.diet) tags.push(...recipeFilter.diet.split(','));
          if (recipeFilter.intolerances) tags.push(...recipeFilter.intolerances.split(','));
          const params = { apiKey: API_KEY, number: 24 };
          if (tags.length) params.tags = tags.join(',');
          const { data } = await axios.get('https://api.spoonacular.com/recipes/random', { params });
          results = data.recipes;
        } else {
          const cacheKey = `recipes-${searchQuery}-${JSON.stringify(recipeFilter)}-page-${page}`;
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            results = JSON.parse(cached);
          } else {
            const params = { apiKey: API_KEY, number: 24, offset: (page - 1) * 24, query: searchQuery || '' };
            if (recipeFilter.type) params.type = recipeFilter.type;
            if (recipeFilter.cuisine) params.cuisine = recipeFilter.cuisine;
            if (recipeFilter.diet) params.diet = recipeFilter.diet;
            if (recipeFilter.intolerances) params.intolerances = recipeFilter.intolerances;
            const { data } = await axios.get('https://api.spoonacular.com/recipes/complexSearch', { params });
            results = data.results;
            if (results.length) sessionStorage.setItem(cacheKey, JSON.stringify(results));
            else setHasMore(false);
          }
        }
        setSpoonacularRecipes(prev => page === 1 ? results : [...prev, ...results]);
      } catch (err) {
        console.error('Error fetching Spoonacular:', err);
      } finally {
        setApiLoading(false);
      }
    };
    fetchAPI();
  }, [page, searchQuery, recipeFilter, userLoading]);

  const handleScroll = useCallback(() => {
    if (!hasMore || apiLoading) return;
    const { scrollTop, scrollHeight } = document.documentElement;
    if (scrollHeight - scrollTop <= window.innerHeight + 100) setPage(prev => prev + 1);
  }, [hasMore, apiLoading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const mixRecipes = (users, api) => {
    const mixed = [];
    let userIndex = 0;
    api.forEach((item, idx) => {
      mixed.push(item);
      if ((idx + 1) % 6 === 0 && userIndex < users.length) {
        mixed.push(users[userIndex]);
        userIndex += 1;
      }
    });
    return mixed;
  };
  const allRecipes = mixRecipes(filteredUserRecipes, spoonacularRecipes);

  const DISPLAY_COUNT = 24;
  const displayedRecipes = allRecipes.slice(0, DISPLAY_COUNT * page);

  const initialLoading = userLoading || (apiLoading && page === 1);
  const skeletonCount = DISPLAY_COUNT;

  return (
    <div className="homepage back">
      <div className="recipe-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {initialLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} delay={i * 100} />)
          : displayedRecipes.length > 0
            ? displayedRecipes.map(r => (
                <div key={r.id || r._id} className="hovering group">
                  <div className="recipe-card">
                    <Link to={`/recipe/${r.id || r._id}`}>  
                      <div className="relative">
                        <img 
                            src={
                                r.image
                                ? (r.image.startsWith('http')
                                    ? r.image
                                    : `data:image/jpeg;base64,${r.image}`)
                                : ''
                            }
                            alt={r.title} 
                            className="w-full h-48 object-cover rounded-2xl" 
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-25 transition-opacity rounded-2xl" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <h3 className="text-white text-lg font-semibold text-center px-2">{r.title}</h3>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              ))
            : <p>No recipes found. Try adjusting your search or filters!</p>
        }
      </div>
      {!initialLoading && apiLoading && (
        <div className="recipe-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} delay={i * 100} />)}
        </div>
      )}
    </div>
  );
}

export default HomePage;