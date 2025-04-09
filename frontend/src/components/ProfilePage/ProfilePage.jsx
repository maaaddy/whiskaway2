import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ProfilePage() {
    const { username } = useParams();
    const [userData, setUserData] = useState(null);
    const [cookbooks, setCookbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [updatedProfile, setUpdatedProfile] = useState({ 
        fName: '', 
        lName: '', 
        bio: '', 
        profilePic: null, 
        coverImage: null 
    });
    const [isFriend, setIsFriend] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [userInfoId, setUserInfoId] = useState(null);
    const [friendCount, setFriendCount] = useState(0);
    const [viewTab, setViewTab] = useState('cookbooks');
    const [recipes, setRecipes] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
          try {
            setLoading(true);
    
            const [profileRes, currentUserRes] = await Promise.all([
              axios.get(username ? `/api/profile/${username}` : `/api/profile`),
              axios.get(`/api/profile`)
            ]);
      
            const profileData = profileRes.data;
            const currentUserData = currentUserRes.data;
      
            setUserData(profileData);
            setCurrentUser(currentUserData.username);
            setUserInfoId(currentUserData.userInfo);
      
            const [friendsRes, cookbooksRes] = await Promise.all([
              axios.get(`/api/friends/${profileData.userInfo}`),
              axios.get(`/api/cookbooks/user/${profileData.username}`)
            ]);
      
            setFriendCount(friendsRes.data.length || 0);
            setCookbooks(cookbooksRes.data.filter(cb => cb.isPublic));

            const recipesRes = await axios.get(`/api/recipes/user/${profileData.username}`);
            const publicRecipes = recipesRes.data.filter(r => r.isPublic);
            setRecipes(publicRecipes);

      
            if (profileData.userInfo !== currentUserData.userInfo) {
              const [recipientInfo, friendsList] = await Promise.all([
                axios.get(`/api/friend-requests/${profileData.userInfo}`),
                axios.get(`/api/friends/${currentUserData.userInfo}`)
              ]);
      
              const alreadySent = recipientInfo.data.some(req => req._id === currentUserData.userInfo);
              const alreadyFriend = friendsList.data.some(
                friend => friend.userInfo?.toString() === profileData.userInfo?.toString()
              );
      
              setRequestSent(alreadySent);
              setIsFriend(alreadyFriend);
            }
      
            setUpdatedProfile({
              fName: profileData.fName,
              lName: profileData.lName,
              bio: profileData.bio,
              profilePic: profileData.profilePic,
              coverImage: profileData.coverImage,
            });
      
          } catch (err) {
            console.error(err);
            setError('Failed to load profile or cookbooks');
          } finally {
            setLoading(false);
          }
        };
      
        fetchData();
      }, [username]);
      

    const handleEditToggle = () => {
        if (currentUser === userData.username) {
            setEditMode(!editMode);
        }
    };
    
    const handleInputChange = (e) => setUpdatedProfile({ ...updatedProfile, [e.target.name]: e.target.value });
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUpdatedProfile({ ...updatedProfile, profilePic: reader.result });
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = async () => {
        try {
            await axios.put(`/api/profile/update`, updatedProfile);
            setUserData(prev => ({ ...prev, ...updatedProfile }));
            setEditMode(false);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };
    
    const copyProfileLink = () => navigator.clipboard.writeText(`https://whiskaway.food/profile/${username || userData.username}`).then(() => alert('Profile link copied!'));

    const sendFriendRequest = async () => {
        try {
          await axios.post('/api/friend-request', {
            fromId: userInfoId,
            toId: userData.userInfo,
          });
          setRequestSent(true);
        } catch (err) {
          console.error('Error sending friend request:', err);
          alert('Failed to send friend request.');
        }
    };
      
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!userData) return <p>No user data found.</p>;

    return (
        <div className="pt-12 profile-page">
          <div className="relative w-10/12 h-80 mb-52 rounded-lg">
            {updatedProfile.coverImage || userData.coverImage ? (
                <img
                src={updatedProfile.coverImage || userData.coverImage}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover rounded-lg z-0"
                />
            ) : (
                <div className="absolute inset-0 w-full h-full bg-gray-200 rounded-lg z-0" />
            )}

            {editMode && (
                <>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                        setUpdatedProfile((prev) => ({ ...prev, coverImage: reader.result }));
                        };
                        reader.readAsDataURL(file);
                    }
                    }}
                    className="hidden"
                    id="cover-upload"
                />
                <label
                    htmlFor="cover-upload"
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 text-white text-sm font-medium cursor-pointer hover:bg-black/40 transition"
                >
                    Click to upload cover photo
                </label>
                </>
            )}
          <div className="absolute bottom-[-5rem] left-0 right-0 mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-6">
            <div className="w-44 h-44 min-h-44 min-w-44 rounded-full overflow-hidden border-4 border-white bg-white relative translate-y-36 sm:translate-y-0 z-30">
                {editMode ? (
                  <>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profile-pic-upload" />
                    <label htmlFor="profile-pic-upload">
                      <img
                        src={updatedProfile.profilePic || userData.profilePic || '/profilepic.jpg'}
                        alt="Profile"
                        className="w-full h-full object-cover aspect-square cursor-pointer"
                      />
                    </label>
                  </>
                ) : (
                  <img
                    src={userData.profilePic || '/profilepic.jpg'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col justify-end items-center sm:items-start h-44 relative translate-y-36 sm:translate-y-28 text-center sm:text-left">
                {editMode ? (
                  <>
                  <div className="flex items-center gap-2 mb-1">
                    <img src="/logo.png" alt="Logo" className="w-5 h-5" />
                    <span className="text-gray-600 text-sm">{userData.username}</span>
                  </div>
                  <div className="flex gap-2 mb-1 pt-2">
                    <input
                      name="fName"
                      value={updatedProfile.fName}
                      onChange={handleInputChange}
                      className="border px-2 rounded-xl w-24 font-semibold"
                      placeholder="First Name"
                    />
                    <input
                      name="lName"
                      value={updatedProfile.lName}
                      onChange={handleInputChange} 
                      className="border px-2 rounded-xl w-24 font-semibold"
                      placeholder="Last Name"
                    />
                  </div>
                  <textarea
                    name="bio"
                    value={updatedProfile.bio}
                    onChange={(e) => {
                        if (e.target.value.length <= 140) {
                        setUpdatedProfile({ ...updatedProfile, bio: e.target.value });
                        }
                    }}
                    className="border px-2 rounded-xl w-36 sm:w-[300px] h-24 resize-none leading-snug"
                    placeholder="Bio"
                    rows={2}
                    maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">{updatedProfile.bio.length}/60 characters</p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleSave}
                      className="bg-blue-200 hover:bg-blue-300 rounded-full px-4 py-2 font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="bg-gray-300 hover:bg-gray-400 rounded-full px-4 py-2 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </>
                
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold text-gray-900">{userData.fName} {userData.lName}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                      {userData.username}
                    </div>
                    <p
                    className="text-gray-600 mt-1 overflow-hidden text-ellipsis whitespace-normal min-h-[2.8rem]"
                    style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.4rem",
                        maxHeight: "2.8rem",
                        width: "100%",
                        maxWidth: "300px",
                    }}
                    >
                    {userData.bio}
                    </p>
                    <p className="text-gray-700 pt-1">{friendCount} friend{friendCount === 1 ? '' : 's'}</p>
                    <div className="flex gap-3 mt-3">
                      <button onClick={copyProfileLink} className="bg-blue-200 hover:bg-blue-300 rounded-full px-4 py-2 font-semibold">Share</button>
                      {currentUser === userData.username ? (
                        <button onClick={handleEditToggle} className="bg-gray-200 hover:bg-gray-300 rounded-full px-4 py-2 font-semibold">Edit Profile</button>
                      ) : isFriend ? (
                        <button disabled className="bg-gray-300 rounded-full px-4 py-2 font-semibold cursor-default">Friends ✓</button>
                      ) : requestSent ? (
                        <button disabled className="bg-yellow-200 rounded-full px-4 py-2 font-semibold cursor-default">Request Sent ✓</button>
                      ) : (
                        <button onClick={sendFriendRequest} className="bg-green-200 hover:bg-green-300 rounded-full px-4 py-2 font-semibold">Add Friend +</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
      
          <hr className="border-t border-gray-300 mt-32 mb-16 w-11/12 mx-auto translate-y-4 sm:translate-y-0" />
          <div className="cookbook-profile max-w-6xl mx-auto px-6 pb-12 translate-y-4 sm:translate-y-0">
            <div className="mb-6">
                <div className="flex justify-start sm:justify-start items-center">
                <div className="flex space-x-4 mx-auto sm:mx-0">
                    <button
                    onClick={() => setViewTab('cookbooks')}
                    className={`px-4 py-1 font-medium border-b-2 ${
                        viewTab === 'cookbooks'
                        ? 'border-teal-600 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    >
                    Cookbooks
                    </button>
                    <button
                    onClick={() => setViewTab('recipes')}
                    className={`px-4 py-1 font-medium border-b-2 ${
                        viewTab === 'recipes'
                        ? 'border-teal-600 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    >
                    Recipes
                    </button>
                </div>
                </div>
            </div>

            {viewTab === 'cookbooks' ? (
                <div className="w-full flex justify-start">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-18 translate-y-2 sm:translate-y-0 justify-start">
                {cookbooks.length > 0 ? (
                    cookbooks.map((cookbook) => (
                    <div
                        key={cookbook._id}
                        className="relative rounded-lg overflow-hidden shadow hover:shadow-lg transition group"
                    >
                        <Link to={`/cookbook/${cookbook._id}`} className="block w-full h-64">
                        <img
                            src={`/${cookbook.coverImage || 'cover1.JPG'}`}
                            alt={`${cookbook.title} Cover`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded-md translate-y-[-20%] text-center">
                            {cookbook.title}
                            </div>
                        </div>
                        </Link>
                    </div>
                    ))
                ) : (
                    <p className="text-center col-span-full text-gray-600">No public cookbooks yet.</p>
                )}
                </div>
                </div>
                </div>
            ) : (
                <div className="w-full flex justify-start">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">    
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-18">
                {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                    <div
                        key={recipe._id}
                        className="relative rounded-lg overflow-hidden shadow hover:shadow-lg transition group"
                    >
                        <Link to={`/recipe/${recipe._id}`} className="block w-full h-64 bg-gray-100">
                        <img
                            src={recipe.image ? `data:image/jpeg;base64,${recipe.image}` : '/placeholder.jpg'}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded-md translate-y-[-20%] text-center">
                            {recipe.title}
                            </div>
                        </div>
                        </Link>
                    </div>
                    ))
                ) : (
                    <p className="text-center col-span-full text-gray-600">No public recipes yet.</p>
                )}
                </div>
                </div>
                </div>
            )}
            </div>

        </div>
      );
      
}
export default ProfilePage;