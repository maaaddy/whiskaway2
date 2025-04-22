import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [topCommented, setTopCommented] = useState([]);
  const [topLiked, setTopLiked] = useState([]);
  const [spoonacularPopular, setSpoonacularPopular] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const API_KEY = process.env.REACT_APP_API_KEY;

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.query = search;
      const res = await axios.get('/api/admin/users', { params });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchEngagement = async () => {
    try {
      const [commentedRes, likedRes] = await Promise.all([
        axios.get('/api/admin/top-commented'),
        axios.get('/api/admin/top-liked'),
      ]);
      setTopCommented(commentedRes.data);
      setTopLiked(likedRes.data);
    } catch (err) {
      console.error('Error fetching engagement data:', err);
    }
  };

  const fetchSpoonacular = async () => {
    try {
      const { data } = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
        params: {
          apiKey: API_KEY,
          sort: 'popularity',
          number: 5,
          addRecipeInformation: true,
        },
      });
      setSpoonacularPopular(data.results || []);
    } catch (err) {
      console.error('Error fetching spoonacular data:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchEngagement();
    fetchSpoonacular();
  }, []);

  const removeUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error('Error removing user:', err);
    }
  };

  const displayedUsers = showAllUsers ? users : users.slice(0, 3);

  return (
    <div className="p-6 back max-w-6xl mx-auto">
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Users</h2>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username..."
            className="border p-2 rounded flex-grow"
          />
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">
                    <button
                      onClick={() => removeUser(user._id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan="2" className="p-3 text-center text-gray-600">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {users.length > 3 && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="text-blue-600 hover:underline"
            >
              {showAllUsers ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
        <div className="py-3 border-b-2"></div>
      </section>

      <div>
        <h2 className="text-center font-semibold text-2xl py-5">Social Interaction Stats</h2>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Top 5 Commented Recipes</h3>
          <ol className="list-decimal list-inside space-y-1">
            {topCommented.length > 0 ? (
              topCommented.map((r) => (
                <li key={r.recipeId} className="flex items-center">
                  <span>{r.title} ({r.commentCount})</span>
                  <a
                    href={`https://whiskaway.food/recipe/${r.recipeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    View
                  </a>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No data</p>
            )}
          </ol>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Top 5 Liked Recipes</h3>
          <ol className="list-decimal list-inside space-y-1">
            {topLiked.length > 0 ? (
              topLiked.map((r) => (
                <li key={r.recipeId} className="flex items-center">
                  <span>{r.title} ({r.likeCount})</span>
                  <a
                    href={`https://whiskaway.food/recipe/${r.recipeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    View
                  </a>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No data</p>
            )}
          </ol>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Top 5 Spoonacular</h3>
          <ol className="list-decimal list-inside space-y-1">
            {spoonacularPopular.length > 0 ? (
              spoonacularPopular.map((r) => (
                <li key={r.id} className="flex items-center">
                  <span>{r.title}</span>
                  <a
                    href={`https://whiskaway.food/recipe/${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    View
                  </a>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No data</p>
            )}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default AdminPage;