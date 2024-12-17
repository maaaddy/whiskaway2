import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faCommentDots, faBook, faUserCircle } from '@fortawesome/free-solid-svg-icons';

function BottomNav() {
    return (
        <div className="bottom-nav">
            <Link to="/">
                <FontAwesomeIcon icon={faHome} /> Home
            </Link>
            <Link to="/search">
                <FontAwesomeIcon icon={faSearch} /> Search
            </Link>
            <Link to="/recipe-books">
                <FontAwesomeIcon icon={faBook} /> Recipe Books
            </Link>
            <Link to="/messages">
                <FontAwesomeIcon icon={faCommentDots} /> Messages
            </Link>
            <Link to="/profile">
                <FontAwesomeIcon icon={faUserCircle} /> Profile
            </Link>
        </div>
    );
}

export default BottomNav;
