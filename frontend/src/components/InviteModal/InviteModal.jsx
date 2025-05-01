import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function InviteModal({
  cookbookId,
  currentUsername,
  onClose,
  onInviteSuccess
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invitingId, setInvitingId] = useState(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/search/users', {
          params: {
            query,
            currentUser: currentUsername
          }
        });
        setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(fetch, 300);
    return () => clearTimeout(timeout);
  }, [query, currentUsername]);

  const invite = async (userId) => {
    setInvitingId(userId);
    try {
      await axios.post(`/api/cookbook/${cookbookId}/share`, {
        toUserId: userId
      });
      onInviteSuccess();
    } catch (err) {
      console.error('Invite failed', err);
      alert(err.response?.data?.error || 'Invite failed');
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold font-serif text-teal-800 mb-4">Invite Collaborator</h2>
        <p className='text-sm font-serif text-gray-500 py-4'>Collaborators will have full access to your cookbook, including deletion.</p>
        <input
          className="w-full border font-serif text-gray-500 p-2 rounded mb-4"
          placeholder="Search by username…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {loading && <p className="text-sm text-gray-500">Searching…</p>}
        {!loading && results.length === 0 && query.trim().length >= 2 && (
          <p className="text-sm font-serif font-thin text-gray-500">No users found</p>
        )}
        <ul className="max-h-60 overflow-y-auto space-y-2">
          {results.map(user => (
            <li key={user._id} className="flex justify-between items-center">
              <span className='font-serif'>{user.username}</span>
              <button
                className="text-sm bg-teal-500 text-white px-2 py-1 rounded disabled:opacity-50"
                disabled={invitingId === user._id}
                onClick={() => invite(user._id)}
              >
                {invitingId === user._id ? 'Inviting…' : 'Invite'}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-right">
          <button className="text-teal-600 hover:underline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}