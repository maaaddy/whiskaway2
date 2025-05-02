import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    fetchEngagement();
    fetchSpoonacular();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search]);

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
    <>
      <main className="min-h-screen bg-[#f2faf9] pt-24 pb-12 font-serif">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="mb-12 pb-12 border-b-2">
            <h2 className="text-2xl font-serif font-semibold text-teal-700 text-center mb-8">
              Social Interaction Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold text-teal-600 mb-4">
                  Top 5 Commented Recipes
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  {topCommented.length > 0 ? (
                    topCommented.map((r) => (
                      <li key={r.recipeId} className="flex items-center justify-between">
                        <span>
                          {r.title} <span className="text-sm text-gray-500">({r.commentCount})</span>
                        </span>
                        <a
                          href={`https://whiskaway.food/recipe/${r.recipeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline ml-2"
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

              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold text-teal-600 mb-4">
                  Top 5 Liked Recipes
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  {topLiked.length > 0 ? (
                    topLiked.map((r) => (
                      <li key={r.recipeId} className="flex items-center justify-between">
                        <span>
                          {r.title} <span className="text-sm text-gray-500">({r.likeCount})</span>
                        </span>
                        <a
                          href={`https://whiskaway.food/recipe/${r.recipeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline ml-2"
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

              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold text-teal-600 mb-4">
                  Top 5 Spoonacular
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  {spoonacularPopular.length > 0 ? (
                    spoonacularPopular.map((r) => (
                      <li key={r.id} className="flex items-center justify-between">
                        <span>{r.title}</span>
                        <a
                          href={`https://whiskaway.food/recipe/${r.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline ml-2"
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
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-semibold text-teal-700 mb-4">
              Users
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search username..."
                className="flex-grow border border-teal-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={fetchUsers}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition"
              >
                Search
              </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-teal-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-teal-700 font-medium">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-teal-700 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {displayedUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4">
                        <Link
                          to={`/profile/${user.username}`}
                          className="text-teal-600 hover:underline"
                        >
                          {user.username}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
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
                      <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {users.length > 3 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className="text-teal-600 hover:underline"
                >
                  {showAllUsers ? 'Show Less' : 'Show More'}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default AdminPage;