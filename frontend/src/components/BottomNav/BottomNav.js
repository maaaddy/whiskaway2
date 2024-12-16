import React from 'react';
import { Link } from 'react-router-dom';

function BottomNav() {
    return (
        <div className="bottom-nav">
            <Link to="/">Home</Link>
            <Link to="/search">Search</Link>
            <Link to="/messages">Messages</Link>
            <Link to="/recipe-books">Recipe Books</Link>
        </div>
    );
}

export default BottomNav;
