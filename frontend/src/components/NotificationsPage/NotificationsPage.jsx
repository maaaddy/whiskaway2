import React, { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../useNotifications';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationPanel({ userInfoId, show, onClose }) {
  const { notifications: fetchedNotifications, markAsRead, loading, fetchNotifications } = useNotifications(userInfoId);
  const [localNotifications, setLocalNotifications] = useState([]);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const notifications = [...localNotifications, ...fetchedNotifications];
  const isInitialLoad = loading && notifications.length === 0;
  const itemsToShow = notifications.filter(n => !n.read);

  const handleNavigate = async (notif) => {
    const { fromUser } = notif;
    switch (notif.type) {
      case 'recipe_like':
      case 'recipe_comment': {
        if (notif.data?.recipeId) {
          let path = `/recipe/${notif.data.recipeId}`;
          if (notif.type === 'recipe_comment' && notif.data.commentId) {
            path += `#comment-${notif.data.commentId}`;
          }
          navigate(path);
        }
        break;
      }
      case 'friend_request':
      case 'friend_accept': {
        let username = fromUser.username;
        if (!username) {
          try {
            const resp = await axios.get(`/api/users/${fromUser._id}`);
            username = resp.data.username;
          } catch (err) {
            console.error('Failed to fetch username, falling back to ID', err);
            username = fromUser._id;
          }
        }
        navigate(`/profile/${username}`);
        break;
      }
      default:
        break;
    }
  };

  const handleClearAll = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => markAsRead(n._id)));
    setLocalNotifications([]);
    await fetchNotifications();
  };

  const handleFriendAction = async (notif, action) => {
    try {
      const endpoint = action === 'accept'
        ? '/api/friend-request/accept'
        : '/api/friend-request/deny';
      await axios.post(endpoint, {
        currentUserId: userInfoId,
        requesterId: notif.fromUser._id,
      });
      await markAsRead(notif._id);
      await fetchNotifications();

      if (action === 'accept') {
        const newNotif = {
          _id: `local-${Date.now()}`,
          type: 'friend_request_response',
          fromUser: notif.fromUser,
          read: false,
          createdAt: new Date().toISOString(),
        };
        setLocalNotifications(prev => [newNotif, ...prev]);
      }
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

  const renderContent = (notif) => {
    const { fromUser } = notif;
    switch (notif.type) {
      case 'friend_request':
        return (
          <div className="rounded-xl">
            <p>{fromUser.fName} {fromUser.lName} sent you a friend request.</p>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                onClick={(e) => { e.stopPropagation(); handleFriendAction(notif, 'accept'); }}
              >Accept</button>
              <button
                className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                onClick={(e) => { e.stopPropagation(); handleFriendAction(notif, 'deny'); }}
              >Deny</button>
            </div>
          </div>
        );
      case 'friend_accept':
        return <p>{fromUser.fName} {fromUser.lName} accepted your friend request.</p>;
      case 'friend_request_response':
        return <p>You accepted {fromUser.fName} {fromUser.lName}'s friend request.</p>;
      case 'recipe_like':
        return <p>{fromUser.fName} {fromUser.lName} liked your recipe.</p>;
      case 'recipe_comment':
        return <p>{fromUser.fName} {fromUser.lName} commented on your recipe.</p>;
      default:
        return <p>You have a new notification.</p>;
    }
  };

  if (!show) return null;

  return (
    <div
      ref={panelRef}
      className="fixed top-14 right-4 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
    >
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <div className="flex space-x-2">
          <button onClick={handleClearAll} className="text-xs text-gray-500 hover:underline">Clear</button>
          <button onClick={onClose} className="text-xs text-gray-500 hover:underline">Close</button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto rounded-xl">
        {isInitialLoad && (
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        )}
        {!isInitialLoad && itemsToShow.length > 0 && (
          itemsToShow.map((notif) => (
            <div
              key={notif._id}
              className="p-3 text-sm border-b hover:bg-blue-50 cursor-pointer "
              onClick={() => handleNavigate(notif)}
            >
              {renderContent(notif)}
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
        {!isInitialLoad && itemsToShow.length === 0 && (
          <p className="p-4 text-gray-400">No notifications.</p>
        )}
      </div>
    </div>
  );
}
