import { useEffect, useState } from "react";
import axios from "axios";
import { refreshFriendRequests } from '../TopBar/TopBar';

export default function NotificationsPage() {
  const [requests, setRequests] = useState([]);
  const [userInfoId, setUserInfoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('/profile');
        const infoId = res.data.userInfo;
        setUserInfoId(infoId);

        const reqs = await axios.get(`/friend-requests/${infoId}`);
        setRequests(reqs.data);
      } catch (err) {
        console.error('Error loading friend requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requesterId) => {
    await axios.post('/friend-request/accept', {
      currentUserId: userInfoId,
      requesterId
    });
    setRequests(prev => prev.filter(req => req._id !== requesterId));
    refreshFriendRequests();
  };
  
  const handleDeny = async (requesterId) => {
    await axios.post('/friend-request/deny', {
      currentUserId: userInfoId,
      requesterId
    });
    setRequests(prev => prev.filter(req => req._id !== requesterId));
    refreshFriendRequests();
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>

      {requests.length === 0 ? (
        <p className="text-gray-500">You don't have any pending friend requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map(user => (
            <div key={user._id} className="flex justify-between items-center bg-white border rounded p-4 shadow-sm">
              <div>
                <p className="font-semibold">{user.fName} {user.lName}</p>
                <p className="text-sm text-gray-600">@{user.username}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAccept(user._id)} className="px-3 py-1 bg-green-500 text-white rounded">Accept</button>
                <button onClick={() => handleDeny(user._id)} className="px-3 py-1 bg-red-500 text-white rounded">Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}