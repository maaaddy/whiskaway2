import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCommentDots, faUserCircle, faPenToSquare, faBookOpen } from '@fortawesome/free-solid-svg-icons';

function BottomNav({ toggleChat }) {
    return (
        <div className="bottom-nav">
            <Link to="/">
                <FontAwesomeIcon icon={faHome} className='text-teal-700' />
            </Link>
            <Link to="/add-recipe">
                <FontAwesomeIcon icon={faPenToSquare} className='text-teal-700' />
            </Link>
            <Link to="/cookbook">
                <FontAwesomeIcon icon={faBookOpen} className='text-teal-700' />
            </Link>
            <button onClick={toggleChat}>
                <FontAwesomeIcon icon={faCommentDots} className='text-teal-700' />
            </button>
            <Link to="/profile">
                <FontAwesomeIcon icon={faUserCircle} className='text-teal-700' />
            </Link>
        </div>
    );
}

export default BottomNav;
