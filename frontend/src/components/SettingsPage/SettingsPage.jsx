import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const intoleranceOptions = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'egg', label: 'Egg' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'grain', label: 'Grain' },
  { value: 'peanut', label: 'Peanut' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'sesame', label: 'Sesame' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'soy', label: 'Soy' },
  { value: 'sulfite', label: 'Sulfite' },
  { value: 'tree nut', label: 'Tree Nut' },
  { value: 'wheat', label: 'Wheat' }
];

const tabKeys = ['username','password','friends','intolerances'];
const getTabFromParam = (param) => {
  if (param === 'manageFriends') return 'friends';
  return tabKeys.includes(param) ? param : 'username';
};

const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = getTabFromParam(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState(initialTab);

  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordPassword, setPasswordPassword] = useState('');
  const [intolerances, setIntolerances] = useState([]);
  const [selectedIntolerances, setSelectedIntolerances] = useState([]);
  const [friends, setFriends] = useState([]);
  const [userInfoId, setUserInfoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [loadingIntolerance, setLoadingIntolerance] = useState(false);
  const [loadingUsername, setLoadingUsername] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    axios.get('/api/profile')
      .then(res => {
        setUsername(res.data.username);
        setUserInfoId(res.data.userInfo);
        setIntolerances(res.data.intolerances || []);
        setSelectedIntolerances(res.data.intolerances || []);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoadingUsername(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'friends' && userInfoId) {
      setLoadingFriends(true);
      axios.get(`/api/friends/${userInfoId}`)
        .then(res => setFriends(res.data))
        .catch(() => toast.error('Failed to fetch friends'))
        .finally(() => setLoadingFriends(false));
    }
  }, [activeTab, userInfoId]);

  const handleUpdateUsername = async () => {
    setLoading(true);
    try {
      await axios.put('/api/settings/username', {
        currentPassword: usernamePassword,
        newUsername
      });
      setUsername(newUsername);
      setNewUsername('');
      setUsernamePassword('');
      toast.success('Username updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setLoadingPwd(true);
    try {
      await axios.put('/api/settings/password', {
        currentPassword: passwordPassword,
        newPassword
      });
      setNewPassword('');
      setPasswordPassword('');
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setLoadingPwd(false);
    }
  };

  const handleUpdateIntolerances = async () => {
    setLoadingIntolerance(true);
    const updated = selectedIntolerances;

    try {
      await axios.put('/api/settings/intolerances', { intolerances: updated });
      setIntolerances(updated);
      toast.success('Allergies updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setLoadingIntolerance(false);
    }
  };
  

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.put('/api/friends/remove', {
        userId: userInfoId,
        friendId
      });
      setFriends(prev => prev.filter(f => f.userInfo !== friendId));
      toast.success('Friend removed');
    } catch (err) {
      toast.error('Failed to remove friend');
    }
  };

  return (
    <div className="flex pt-12 min-h-screen font-serif">
      <Toaster position='top-right' />

      <div className="flex flex-col gap-2 w-64 px-4 pt-4 shadow-md bg-white">
        {[
          { key: 'username', label: 'Change Username' },
          { key: 'password', label: 'Change Password' },
          { key: 'friends', label: 'Manage Friends' },
          { key: 'intolerances', label: 'Update Allergies' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`text-left px-3 py-2 rounded-2xl transition ${
              activeTab === item.key
                ? 'bg-teal-600 text-white font-medium'
                : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 py-8 flex justify-start">
      <div className="w-full max-w-6xl px-10">
        <div className="w-full max-w-xl space-y-6">
          <h1 className="text-2xl font-bold text-teal-800">
            {activeTab === 'username' && 'Change Username'}
            {activeTab === 'password' && 'Change Password'}
            {activeTab === 'intolerances' && 'Update Allergies'}
            {activeTab === 'friends' && 'Manage Friends'}
          </h1>

          {activeTab === 'username' && (
            loadingUsername ? (
              <p className="text-gray-500">Loading user...</p>
            ) : (
              <>
                <p className="text-sm text-gray-500">Current username: <strong>{username}</strong></p>
                <input
                  type="text"
                  placeholder="New username"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="password"
                  placeholder="Current password"
                  value={usernamePassword}
                  onChange={e => setUsernamePassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
                <button
                  onClick={handleUpdateUsername}
                  disabled={loading}
                  className="bg-teal-600 text-white px-4 py-2 rounded-3xl hover:bg-teal-700"
                >
                  {loading ? 'Updating...' : 'Update Username'}
                </button>
              </>
            )
          )}

          {activeTab === 'password' && (
            <>
              <p className="text-sm text-gray-500">Choose a strong password and don't reuse it for other accounts. 
                Your password must be at least <strong>6 characters long</strong>.
              </p>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="password"
                placeholder="Current password"
                value={passwordPassword}
                onChange={e => setPasswordPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              <button
                onClick={handleUpdatePassword}
                disabled={loadingPwd}
                className="bg-teal-600 text-white px-4 py-2 rounded-3xl hover:bg-teal-700"
              >
                {loadingPwd ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}

          {activeTab === 'intolerances' && (
            <>
              <p className="text-sm text-gray-500">Select dietary intolerances</p>

              <div className="space-y-2">
              <Select
                isMulti
                options={intoleranceOptions}
                value={intoleranceOptions.filter(opt =>
                  selectedIntolerances.includes(opt.value)
                )}
                onChange={(selected) =>
                  setSelectedIntolerances(selected.map(opt => opt.value))
                }
                classNamePrefix="custom"
                classNames={{
                  control: () =>
                    'border border-teal-500 px-2 py-1 rounded-md shadow-none',
                  option: (state) =>
                    state.isSelected
                      ? 'bg-teal-100 text-teal-800 font-medium px-3 py-2 text-sm cursor-pointer'
                      : state.isFocused
                      ? 'bg-teal-50 text-teal-700 px-3 py-2 text-sm cursor-pointer'
                      : 'text-gray-700 px-3 py-2 text-sm cursor-pointer',
                  multiValue: () =>
                    'bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded-full',
                  multiValueRemove: () =>
                    'ml-1 text-teal-500 cursor-pointer rounded-full',
                }}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    boxShadow: 'none',
                    borderColor: state.isFocused ? '#14b8a6' : '#d1d5db',
                    '&:hover': {
                      borderColor: '#14b8a6',
                    },
                  }),
                }}
                className="text-sm"
              />
                <button
                  onClick={handleUpdateIntolerances}
                  className="bg-teal-600 text-white px-4 py-2 rounded-3xl hover:bg-teal-700"
                >
                  {loadingIntolerance ? 'Saving...' : 'Update Allergies'}
                </button>
              </div>

              {intolerances.length > 0 ? (
                <>
                  <h3 className="text-2xl font-bold text-teal-800 pt-6 border-t-2">Current Allergies:</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {intolerances.map(item => (
                      <span
                        key={item}
                        className="bg-gray-200 text-gray-800 text-xs px-3 py-2 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 pt-2">No allergies listed</p>
              )}
            </>
          )}

          {activeTab === 'friends' && (
            <>
              {loadingFriends ? (
                <p className="text-gray-500">Loading friends...</p>
              ) : friends.length === 0 ? (
                <p className="text-gray-500">No friends added yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-max">
                  {friends.map(friend => (
                    <div
                    key={friend._id}
                    className="flex items-center gap-4 p-4 rounded-md border border-gray-200 bg-white"
                  >
                    {friend.profilePic ? (
                      <img
                        src={friend.profilePic}
                        alt="profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <img
                        src={"/user.png"}
                        alt="profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}

                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {friend.fName} {friend.lName}
                      </p>
                      <p className="text-sm text-gray-500">@{friend.username}</p>
                    </div>
                  
                    <button
                      onClick={() => {
                        const confirmRemove = window.confirm(
                          `Remove @${friend.username}? You won't be able to send or recieve chats from this user any more.`
                        );
                        if (confirmRemove) handleRemoveFriend(friend.userInfo);
                      }}
                      className="text-teal-500 text-sm flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;