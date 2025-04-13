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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" width="28" height="28">
                <rect x="0" y="0" rx="8" ry="8" width="64" height="72" fill="#1e6b64" />
                <circle cx="24" cy="20" r="6" fill="white" />
                <circle cx="32" cy="18" r="9" fill="white" />
                <circle cx="40" cy="20" r="6" fill="white" />
                <rect x="23" y="28" width="18" height="10" rx="1" fill="white" />

                <rect x="12" y="46" width="40" height="4" rx="2" fill="white" />
                <rect x="12" y="54" width="40" height="4" rx="2" fill="white" />
            </svg>


            {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" width="28" height="28">
                <rect x="0" y="0" rx="8" ry="8" width="64" height="72" fill="#1e6b64" />
                <circle cx="16" cy="12" r="4" fill="white" />
                <circle cx="22" cy="10" r="5" fill="white" />
                <circle cx="28" cy="12" r="4" fill="white" />
                <rect x="16" y="14" width="12" height="8" rx="1" fill="white" />
                <rect x="12" y="30" width="40" height="6" rx="3" fill="white" />
                <rect x="12" y="42" width="40" height="6" rx="3" fill="white" />
                <rect x="12" y="54" width="40" height="6" rx="3" fill="white" />
            </svg> */}
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
