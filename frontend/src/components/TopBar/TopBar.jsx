import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell, faCog, faSignOutAlt, faShield } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import NotificationPanel from "../NotificationsPage/NotificationsPage";
import { useNotifications } from "../useNotifications";

export let refreshFriendRequests = () => {};

const mealTypeOptions = [
    { value: "", label: "All Meal Types" },
    { value: "main course", label: "Main Course" },
    { value: "side dish", label: "Side Dish" },
    { value: "dessert", label: "Dessert"},
    { value: "appetizer", label: "Appetizer" },
    { value: "salad", label: "Salad"},
    { value: "bread", label: "Bread"},
    { value: "breakfast", label: "Breakfast" },
    { value: "soup", label: "Soup"},
    { value: "beverage", label: "Beverage" },
    { value: "sauce", label: "Sauce" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "marinade", label: "Marinade" },
    { value: "fingerfood", label: "Finger Food" },
    { value: "snack", label: "Snack" },
    { value: "drink", label: "Drink" }
];

const cuisineOptions = [
    { value: "", label: "All Cuisines" },
    { value: "african", label: "African" },
    { value: "asian", label: "Asian" },
    { value: "american", label: "American" },
    { value: "british", label: "British" },
    { value: "cajun", label: "Cajun" },
    { value: "caribbean", label: "Caribbean" },
    { value: "chinese", label: "Chinese" },
    { value: "eastern european", label: "Eastern European" },
    { value: "european", label: "European" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "greek", label: "Greek" },
    { value: "indian", label: "Indian" },
    { value: "irish", label: "Irish" },
    { value: "italian", label: "Italian" },
    { value: "japanese", label: "Japanese" },
    { value: "jewish", label: "Jewish" },
    { value: "korean", label: "Korean" },
    { value: "latin american", label: "Latin American" },
    { value: "mediterranean", label: "Mediterranean" },
    { value: "mexican", label: "Mexican" },
    { value: "middle eastern", label: "Middle Eastern" },
    { value: "nordic", label: "Nordic" },
    { value: "southern", label: "Southern" },
    { value: "spanish", label: "Spanish" },
    { value: "thai", label: "Thai" },
    { value: "vietnamese", label: "Vietnamese" }
];

const dietOptions = [
    { value: "", label: "All Diets" },
    { value: "gluten free", label: "Gluten-Free" },
    { value: "ketogenic", label: "Ketogenic" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "lacto vegetarian", label: "Lacto-Vegetarian" },
    { value: "ovo vegetarian", label: "Ovo-Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "pescetarian", label: "Pescetarian" },
    { value: "paleo", label: "Paleo" },
    { value: "primal", label: "Primal" },
    { value: "low fodmap", label: "Low FODMAP" },
    { value: "whole30", label: "Whole30" }
];

const intoleranceOptions = [
    { value: "", label: "No Intolerances" },
    { value: "dairy", label: "Dairy-Free" },
    { value: "egg", label: "Egg-Free" },
    { value: "gluten", label: "Gluten-Free" },
    { value: "grain", label: "Grain-Free" },
    { value: "peanut", label: "Peanut-Free" },
    { value: "seafood", label: "Seafood-Free" },
    { value: "sesame", label: "Sesame-Free" },
    { value: "shellfish", label: "Shellfish-Free" },
    { value: "soy", label: "Soy-Free" },
    { value: "sulfite", label: "Sulfite-Free" },
    { value: "tree nut", label: "Tree Nut-Free" },
    { value: "wheat", label: "Wheat-Free" }
];

function filterOptions(options, selected) {
    return selected.some(opt => opt.value === "") ? [options[0]] : options.slice(1);
}

function TopBar({ searchQuery, setSearchQuery, setRecipeFilter, onLogout }) {
    const location = useLocation();
    const showSearchBar = location.pathname === "/";
    const showUserSearchBar = location.pathname.startsWith("/profile");
    const showRecipeSearchBar = location.pathname.startsWith("/add-recipe2");

    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [filtersVisible, setFiltersVisible] = useState(false);
    const filterRef = useRef(null);
    
    const [selectedMealType, setSelectedMealType] = useState([]);
    const [selectedCuisine, setSelectedCuisine] = useState([]);
    const [selectedDiet, setSelectedDiet] = useState([]);
    const [selectedIntolerance, setSelectedIntolerance] = useState([]);
    const [loggedInUsername, setLoggedInUsername] = useState(null);

    const [userInfoId, setUserInfoId] = useState(null);
    const { unreadCount } = useNotifications(userInfoId);
    const [showNotifications, setShowNotifications] = useState(false);

    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get("/api/profile");
                setLoggedInUsername(response.data.username);
                setUserInfoId(response.data.userInfo);
            } catch (error) {
                console.error("Error fetching logged-in user:", error);
            }
        };
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        const fetchFriendRequests = async () => {
          try {
            const res = await axios.get("/api/profile");
            const infoId = res.data.userInfo;
      
            const requestsRes = await axios.get(`/api/friend-requests/${infoId}`);
            setRequestCount(requestsRes.data.length);
          } catch (err) {
            console.error("TopBar: Error loading friend requests:", err);
          }
        };
      
        refreshFriendRequests = fetchFriendRequests;
        fetchFriendRequests();
      }, []);
      

    useEffect(() => {
        if (userSearchQuery.length > 0 && loggedInUsername) {
            axios.get(`/api/search/users?query=${userSearchQuery}&currentUser=${loggedInUsername}`)
                .then(res => setSearchResults(res.data))
                .catch(err => console.error("User search failed:", err));
        } else {
            setSearchResults([]);
        }
    }, [userSearchQuery, loggedInUsername]);    

    const applyFilters = () => {
        setRecipeFilter({
            type: selectedMealType.map(option => option.value).join(","),
            cuisine: selectedCuisine.map(option => option.value).join(","),
            diet: selectedDiet.map(option => option.value).join(","),
            intolerances: selectedIntolerance.map(option => option.value).join(",")
        });
        setFiltersVisible(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setFiltersVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleOpen = () => setShowNotifications(true);
        window.addEventListener('openNotificationsPanel', handleOpen);
        return () => window.removeEventListener('openNotificationsPanel', handleOpen);
      }, []);      

    return (
        <div className="fixed w-full bg-white backdrop-blur-md shadow-sm px-6 flex h-12 py-1 items-center justify-between z-50">
            <Link to="/" className="flex items-center space-x-3">
                <img src="/whiskaway.png" alt="Logo" className="w-9 h-auto" />
                <span className="text-xl text-teal-700 font-semibold font-serif">
                    WhiskAway
                </span>
            </Link>

            {showSearchBar && (
                <div className="search-container" ref={filterRef}>
                    <input
                        type="text"
                        placeholder="Search Recipes..."
                        value={searchQuery}
                        onFocus={() => setFiltersVisible(true)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-5 py-2 pl-12 rounded-full bg-gray-100 backdrop-blur-md border border-gray-100 focus:outline-none"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    
                    {filtersVisible && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-md p-4 mt-2 z-50">
                            <Select
                                options={filterOptions(mealTypeOptions, selectedMealType)}
                                isMulti
                                value={selectedMealType}
                                onChange={setSelectedMealType}
                                placeholder="Select Meal Type..."
                            />
                            <Select
                                options={filterOptions(cuisineOptions, selectedCuisine)}
                                isMulti
                                value={selectedCuisine}
                                onChange={setSelectedCuisine}
                                placeholder="Select Cuisine..."
                            />
                            <Select
                                options={filterOptions(dietOptions, selectedDiet)}
                                isMulti
                                value={selectedDiet}
                                onChange={setSelectedDiet}
                                placeholder="Select Diet..."
                            />
                            <Select
                                options={filterOptions(intoleranceOptions, selectedIntolerance)}
                                isMulti
                                value={selectedIntolerance}
                                onChange={setSelectedIntolerance}
                                placeholder="Select Intolerances..."
                            />
                            <button onClick={applyFilters} className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-md shadow-md hover:bg-teal-600 transition">
                                Apply Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showUserSearchBar && (
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Find friends..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="px-5 py-2 pl-12 rounded-full bg-gray-100 backdrop-blur-md border border-gray-100 focus:outline-none"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    
                    {searchResults.length > 0 && (
                        <ul className="absolute top-full left-0 w-full bg-white border rounded-md shadow-md mt-2 z-50">
                            {searchResults.map(user => (
                                <li 
                                    key={user.username} 
                                    className="px-4 py-2 flex items-center space-x-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => {
                                        window.location.href = `/profile/${user.username}`;
                                        setUserSearchQuery("");
                                    }}
                                >
                                    <img src="/whiskaway.png" alt="Logo" className="w-6 h-6 object-contain" />
                                    <span>{user.username}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {showRecipeSearchBar && (
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search Your Recipes..."
                        value={recipeSearchQuery}
                        onChange={(e) => setRecipeSearchQuery(e.target.value)}
                        className="px-5 py-2 pl-12 rounded-full bg-gray-100 backdrop-blur-md border border-gray-100 focus:outline-none"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
            )}

            <div className="flex items-center space-x-5 text-teal-700 flex-shrink-0">
            
                <>
                <div className="relative">
                    <button
                    onClick={() => setShowNotifications(v => !v)}
                    className="relative hover:text-yellow-600 transition"
                    >
                    <FontAwesomeIcon icon={faBell} size="lg" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-50">
                        {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    </button>
                    <NotificationPanel
                    userInfoId={userInfoId}
                    show={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    />
                </div>

                <Link to="/settings" className="hover:text-gray-700 transition">
                    <FontAwesomeIcon icon={faCog} size="lg" />
                </Link>

                <button
                    onClick={(e) => { e.preventDefault(); onLogout(); }}
                    className="hover:text-red-500 transition"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
                </button>
                </>
            </div>
        </div>
    );
}

export default TopBar;