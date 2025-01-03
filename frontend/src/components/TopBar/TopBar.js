import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInfoCircle, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

<<<<<<< Updated upstream
function TopBar() {

    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/recipes')
            .then(response => setRecipes(response.data))
            .catch(err => console.error('Error fetching recipes:', err));
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState(recipes);
    const location = useLocation();
=======
function TopBar({ searchQuery, setSearchQuery, onLogout }) {
    const location = useLocation();
    const showSearchBar = location.pathname === '/home';
>>>>>>> Stashed changes

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
    
        const filtered = recipes.filter((recipe) => {
            const recipeTitle = recipe.title ? recipe.title.toLowerCase() : '';
    
            return recipeTitle.startsWith(query);
        });
    
        setFilteredRecipes(filtered);
    };

    const showSearchBar = location.pathname === '/';

    return (
        <div className="top-bar">
            <div className="logo">
<<<<<<< Updated upstream
                <h1>|||| WhiskAway</h1>
=======
                <img src="/logo.png" alt="Logo" className="w-12 h-auto" />
                <span className="text-xl text-gray-700 font-bold">WhiskAway</span>
>>>>>>> Stashed changes
            </div>

            {showSearchBar && (
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>
            )}

            <div className="icons">
                <Link to="/about">
                    <FontAwesomeIcon icon={faInfoCircle} />
                </Link>
                <Link to="/settings">
                    <FontAwesomeIcon icon={faCog} />
                </Link>
                <a href="/" onClick={onLogout} className="text-gray-700 hover:text-blue-500">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                </a>
            </div>

            {showSearchBar && searchQuery && (
                <div className="search-results">
                    {filteredRecipes.length > 0 ? (
                        filteredRecipes.map((recipe) => (
                            <div key={recipe.id} className="search-result">
                                <h3>{recipe.title}</h3>
                            </div>
                        ))
                    ) : (
                        <p>No recipes found.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default TopBar;
