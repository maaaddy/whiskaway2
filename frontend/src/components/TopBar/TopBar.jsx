import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faInfoCircle, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

function TopBar({ searchQuery, setSearchQuery, onLogout }) {
    const location = useLocation();
    const showSearchBar = location.pathname === "/";
    const showCookbookSearch = location.pathname === "/profile" || location.pathname === "/recipe-books";

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

    return (
        <div className="fixed top-0 left-0 w-full bg-[#ebf6f7] backdrop-blur-md shadow-md py-3 px-6 flex items-center justify-between z-50">
            <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="Logo" className="w-12 h-auto" />
                <span className="text-xl text-teal-700 font-bold">WhiskAway</span>
            </div>
            {(showSearchBar || showCookbookSearch) && (
                <div className="relative w-1/2">
                    <input
                        type="text"
                        placeholder={showSearchBar ? "Search recipes..." : "Search Your Cookbooks..."}
                        value={searchQuery}
                        onChange={showSearchBar ? handleSearchChange : handleCookbookChange}
                        className="w-full px-5 py-3 pl-12 rounded-full bg-white/70 backdrop-blur-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
