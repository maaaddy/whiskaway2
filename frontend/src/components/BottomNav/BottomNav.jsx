import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCommentDots, faUserCircle, faPenToSquare, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function BottomNav({ toggleChat }) {
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchChatAlerts = async () => {
      try {
        const profileRes = await axios.get('/api/profile');
        const userInfoId = profileRes.data.userInfo;
        const friendsRes = await axios.get(`/api/friends/${userInfoId}`);
        const friends = friendsRes.data;

        const lastViewed = parseInt(localStorage.getItem('lastChatViewed') || '0', 10);
        const count = friends.reduce((sum, f) => {
          if (f.latestMessage) {
            const msgTime = new Date(f.latestMessage.createdAt).getTime();
            if (msgTime > lastViewed) return sum + 1;
          }
          return sum;
        }, 0);

        if (isMounted) setUnreadChats(count);
      } catch (err) {
        console.error('Error fetching chat alerts', err);
      }
    };

    fetchChatAlerts();
    const iv = setInterval(fetchChatAlerts, 30000);

    const onOpened = () => setUnreadChats(0);
    window.addEventListener('chatOpened', onOpened);

    return () => {
      isMounted = false;
      clearInterval(iv);
      window.removeEventListener('chatOpened', onOpened);
    };
  }, []);

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
      </Link>
      <Link to="/cookbook">
        <FontAwesomeIcon icon={faBookOpen} className='text-teal-700' />
      </Link>
      <button onClick={toggleChat} className="relative">
        {unreadChats > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-3.5 h-3.5 rounded-full flex items-center justify-center">
            
          </span>
        )}
        <FontAwesomeIcon icon={faCommentDots} className='text-teal-700' />
      </button>
      <Link to="/profile">
        <FontAwesomeIcon icon={faUserCircle} className='text-teal-700' />
      </Link>
    </div>
  );
}

export default BottomNav;