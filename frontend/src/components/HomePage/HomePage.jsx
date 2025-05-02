import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RecipeDetailPage from '../RecipeDetailPage/RecipeDetailPage';
import Modal from '../Modal';

const SkeletonCard = ({ delay = 0 }) => (
  <div className="hovering group">
    <div
      className="recipe-card animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-full h-48 bg-gray-300 rounded-2xl"></div>
    </div>
  </div>
);

const isValidImage = (image) => {
  if (!image) return false;
  if (image.startsWith('data:')) return true;

  try {
    new URL(image);
    return true;
  } catch (err) {
    return false;
  }
};

function HomePage({ searchQuery, recipeFilter }) {
  const [spoonacularRecipes, setSpoonacularRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [filteredUserRecipes, setFilteredUserRecipes] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
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
        const normalized = res.data.map(r => {
          const raw = r.image || '';
          const isRawBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(raw);
          return {
            ...r,
            image: isRawBase64
              ? `data:image/jpeg;base64,${raw}`
              : raw
          };
        });
        const validUsers = normalized.filter(r => isValidImage(r.image));
        setUserRecipes(validUsers);
        setFilteredUserRecipes(applyUserFilters(validUsers));
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
        if (!isFiltered() && page === 1) {
          const tags = [];
          if (recipeFilter.type)      tags.push(...recipeFilter.type.split(','));
          if (recipeFilter.cuisine)   tags.push(...recipeFilter.cuisine.split(','));
          if (recipeFilter.diet)      tags.push(...recipeFilter.diet.split(','));
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
            const params = {
              apiKey: API_KEY,
              number: 24,
              offset: (page - 1) * 24,
              query: searchQuery || '',
              ...(recipeFilter.type         && { type: recipeFilter.type }),
              ...(recipeFilter.cuisine      && { cuisine: recipeFilter.cuisine }),
              ...(recipeFilter.diet         && { diet: recipeFilter.diet }),
              ...(recipeFilter.intolerances && { intolerances: recipeFilter.intolerances }),
            };
            const { data } = await axios.get('https://api.spoonacular.com/recipes/complexSearch', { params });
            results = data.results;
            if (results.length) sessionStorage.setItem(cacheKey, JSON.stringify(results));
            else setHasMore(false);
          }
        }

        results = results.filter(r => isValidImage(r.image));
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
    <div className="py-16">
      <div className="recipe-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {initialLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} delay={i * 100} />)
          : displayedRecipes.length > 0
            ? displayedRecipes.map(r => (
              <div key={r.id || r._id} className="hovering group">
                <div className="recipe-card">
                  <div
                    className="relative cursor-pointer"
                    onClick={() => setSelectedId(r.id || r._id)}
                  >
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full h-48 object-cover rounded-2xl"
                      onError={e => {
                        const card = e.currentTarget.closest('.recipe-card');
                        if (card) card.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-25 transition-opacity rounded-2xl" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-white text-lg font-semibold text-center px-2">{r.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))
            : <p>No recipes found. Try adjusting your search or filters!</p>
        }
      </div>
      {selectedId && (
        <Modal onClose={() => setSelectedId(null)}>
          <RecipeDetailPage recipeId={selectedId} />
        </Modal>
      )}
      {!initialLoading && apiLoading && (
        <div className="recipe-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} delay={i * 100} />)}
        </div>
      )}
    </div>
  );
}

export default HomePage;