import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faInfoCircle, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

function TopBar({ searchQuery, setSearchQuery, setRecipeFilter, onLogout }) {
    const location = useLocation();
    const showSearchBar = location.pathname === "/";
    const showCookbookSearch = location.pathname === "/profile" || location.pathname === "/recipe-books";

    const [selectedCuisine, setSelectedCuisine] = useState("all");
    const [selectedMealType, setSelectedMealType] = useState("all");
    const [selectedDiet, setSelectedDiet] = useState("all");
    const [selectedIntolerance, setSelectedIntolerance] = useState("none");

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCookbookChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleLogoutClick = (e) => {
        e.preventDefault();
        onLogout();
    };

    const applyFilters = (e) => {
        e.preventDefault();
        setRecipeFilter({
            diet: selectedDiet !== "all" ? selectedDiet : "",
            type: selectedMealType !== "all" ? selectedMealType : "",
            cuisine: selectedCuisine !== "all" ? selectedCuisine : "",
            intolerances: selectedIntolerance !== "none" ? selectedIntolerance : ""
        });
    };
    
    return (
        <div className="fixed top-0 left-0 w-full bg-[#ebf6f7] backdrop-blur-md shadow-md py-3 px-6 flex items-center justify-between z-50">
            <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="Logo" className="w-12 h-auto" />
                <span className="text-xl text-teal-700 font-bold">WhiskAway</span>
            </div>

            {(showSearchBar || showCookbookSearch) && (
                <div className="relative flex items-center space-x-3">
                    <input
                        type="text"
                        placeholder={showSearchBar ? "Search recipes..." : "Search Your Cookbooks..."}
                        value={searchQuery}
                        onChange={showSearchBar ? handleSearchChange : handleCookbookChange}
                        className="w-64 px-5 py-3 pl-12 rounded-full bg-white/70 backdrop-blur-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />

                    {showSearchBar && (
                        <div className="flex space-x-2">
                            <select
                                onChange={(e) => setSelectedMealType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="all">All Meal Types</option>
                                <option value="breakfast">Breakfast</option>
                                <option value="main course">Lunch/Dinner</option>
                                <option value="dessert">Dessert</option>
                            </select>

                            <select
                                onChange={(e) => setSelectedCuisine(e.target.value)}
                                value={selectedCuisine}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="all">All Cuisines</option>
                                <option value="italian">Italian</option>
                                <option value="mexican">Mexican</option>
                                <option value="chinese">Chinese</option>
                                <option value="american">American</option>
                                <option value="indian">Indian</option>
                            </select>

                            <select
                                onChange={(e) => setSelectedDiet(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="all">All Recipes</option>
                                <option value="vegetarian">Vegetarian</option>
                                <option value="vegan">Vegan</option>
                                <option value="gluten-free">Gluten-Free</option>
                                <option value="ketogenic">Keto Friendly</option>
                                <option value="paleo">Paleo</option>
                                <option value="low-carb">Low Carb</option>
                                <option value="high-protein">High Protein</option>
                                <option value="dairy-free">Dairy-Free</option>
                                <option value="nut-free">Nut-Free</option>
                                <option value="low-sodium">Low Sodium</option>
                                <option value="mediterranean">Mediterranean</option>
                                <option value="whole30">Whole30</option>
                                <option value="flexitarian">Flexitarian</option>
                            </select>

                            <select
                                onChange={(e) => setSelectedIntolerance(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="none">No Intolerances</option>
                                <option value="dairy">Dairy-Free</option>
                                <option value="egg">Egg-Free</option>
                                <option value="gluten">Gluten-Free</option>
                                <option value="grain">Grain-Free</option>
                                <option value="peanut">Peanut-Free</option>
                                <option value="seafood">Seafood-Free</option>
                                <option value="sesame">Sesame-Free</option>
                                <option value="shellfish">Shellfish-Free</option>
                                <option value="soy">Soy-Free</option>
                                <option value="sulfite">Sulfite-Free</option>
                                <option value="tree nut">Tree Nut-Free</option>
                                <option value="wheat">Wheat-Free</option>
                            </select>
                        </div>
                    )}

                    <button
                        onClick={applyFilters}
                        className="px-4 py-2 bg-teal-500 text-white rounded-md shadow-md hover:bg-teal-600 transition"
                    >
                        Apply Filters
                    </button>
                </div>
            )}

            <div className="flex items-center space-x-5 text-teal-700">
                <Link to="/about" className="hover:text-teal-500 transition">
                    <FontAwesomeIcon icon={faInfoCircle} size="lg" />
                </Link>
                <Link to="/settings" className="hover:text-gray-700 transition">
                    <FontAwesomeIcon icon={faCog} size="lg" />
                </Link>
                <a href="/" onClick={handleLogoutClick} className="hover:text-red-500 transition">
                    <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
                </a>
            </div>
        </div>
    );
}

export default TopBar;