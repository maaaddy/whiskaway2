import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInfoCircle, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function TopBar({ searchQuery, setSearchQuery, onLogout }) {
    const location = useLocation();
    const showSearchBar = location.pathname === '/home';

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="top-bar">
            <div className="logo">
                <img src="/logo.png" alt="Logo" className="w-12 h-auto" />
                <span className="text-xl text-gray-700 font-bold">WhiskAway</span>
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
        </div>
    );
}

export default TopBar;
