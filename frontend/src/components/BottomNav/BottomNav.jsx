import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCommentDots, faUserCircle, faPenToSquare, faBookOpen } from '@fortawesome/free-solid-svg-icons';

function BottomNav() {
    return (
        // <div className="bottom-nav">
        //     <Link to="/">
        //         <FontAwesomeIcon icon={faHome} className='text-teal-700' /> Home
        //     </Link>
        //     <Link to="/add-recipe">
        //         <FontAwesomeIcon icon={faPenToSquare} className='text-teal-700' /> Create
        //     </Link>
        //     <Link to="/recipe-books">
        //         <FontAwesomeIcon icon={faBookOpen} className='text-teal-700' /> Recipe Books
        //     </Link>
        //     <Link to="/messages">
        //         <FontAwesomeIcon icon={faCommentDots} className='text-teal-700' /> Messages
        //     </Link>
        //     <Link to="/profile">
        //         <FontAwesomeIcon icon={faUserCircle} className='text-teal-700' /> Profile
        //     </Link>
        // </div>
        <div className="bottom-nav">
            <Link to="/">
                <FontAwesomeIcon icon={faHome} className='text-teal-700' />
            </Link>
            <Link to="/add-recipe">
                <FontAwesomeIcon icon={faPenToSquare} className='text-teal-700' />
            </Link>
            <Link to="/recipe-books">
                <FontAwesomeIcon icon={faBookOpen} className='text-teal-700' />
            </Link>
            <Link to="/messages">
                <FontAwesomeIcon icon={faCommentDots} className='text-teal-700' />
            </Link>
            <Link to="/profile">
                <FontAwesomeIcon icon={faUserCircle} className='text-teal-700' />
            </Link>
        </div>
    );
}

export default BottomNav;
