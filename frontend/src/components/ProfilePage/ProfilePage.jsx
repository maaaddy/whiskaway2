import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import NotificationPanel from '../NotificationsPage/NotificationsPage';

function ProfilePage() {
    const { username } = useParams();
    const [userData, setUserData] = useState(null);
    const [cookbooks, setCookbooks] = useState([]);

    const loadCookbooks = async (username) => {
      try {
        setLoadingCookbooks(true);
        const res = await axios.get(`/api/cookbooks/user/${username}`);
        setCookbooks(res.data.filter(cb => cb.isPublic));
        setCookbooksLoaded(true);
        } catch (err) {
          console.warn('Failed to load cookbooks');
        } finally {
          setLoadingCookbooks(false);
        }
    };

    const loadRecipes = async (username) => {
      try {
        setLoadingRecipes(true);
        const res = await axios.get(`/api/recipes/user/${username}`);
        setRecipes(res.data.filter(r => r.isPublic));
        setRecipesLoaded(true);
      } catch (err) {
        console.warn('Failed to load recipes');
      } finally {
        setLoadingRecipes(false);
      }
    };

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
    const [incomingRequest, setIncomingRequest] = useState(false);
    const [userInfoId, setUserInfoId] = useState(null);
    const [friendCount, setFriendCount] = useState(0);
    const [viewTab, setViewTab] = useState('cookbooks');
    const [recipes, setRecipes] = useState([]);
    const [loadingRecipes, setLoadingRecipes] = useState(true);
    const [loadingCookbooks, setLoadingCookbooks] = useState(true);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [recipesLoaded, setRecipesLoaded] = useState(false);
    const [cookbooksLoaded, setCookbooksLoaded] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found. Skipping profile fetch');
        return;
      }
      const loadProfile = async () => {
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
    
          setUpdatedProfile({
            fName: profileData.fName,
            lName: profileData.lName,
            bio: profileData.bio,
            profilePic: profileData.profilePic,
            coverImage: profileData.coverImage,
          });
    
          if (!cookbooksLoaded && viewTab === 'cookbooks') {
            loadCookbooks(profileData.username);
          }
    
          if (!recipesLoaded && viewTab === 'recipes') {
            loadRecipes(profileData.username);
          }
    
          loadFriends(profileData.userInfo);
          checkFriendStatus(profileData.userInfo, currentUserData.userInfo);
        } catch (err) {
          if (err.response?.status === 401) {
            console.warn('User logged out, skipping profile load');
            return;
          }
          console.error(err);
          setError('Failed to load profile');
        } finally {
          setLoading(false);
        }
      };
    
      const loadFriends = async (userInfoId) => {
        try {
          setLoadingFriends(true);
          const res = await axios.get(`/api/friends/${userInfoId}`);
          setFriendCount(res.data.length || 0);
        } catch (err) {
          console.warn('Failed to load friends');
        } finally {
          setLoadingFriends(false);
        }
      };
    
      const checkFriendStatus = async (profileUserInfoId, currentUserInfoId) => {
        if (profileUserInfoId === currentUserInfoId) return;
    
        try {
          const [outgoingRes, friendsRes, incomingRes] = await Promise.all([
            axios.get(`/api/friend-requests/${profileUserInfoId}`),
            axios.get(`/api/friends/${currentUserInfoId}`),
            axios.get(`/api/friend-requests/${currentUserInfoId}`)
          ]);
          
          setRequestSent(
            outgoingRes.data.some(req => req._id === currentUserInfoId)
          );
          setIncomingRequest(
            incomingRes.data.some(req => req._id === profileUserInfoId)
          );
          setIsFriend(
            friendsRes.data.some(f => f.userInfo?.toString() === profileUserInfoId)
          );          
        } catch (err) {
          console.warn('Failed to check friend status');
        }
      };
    
      loadProfile();
    }, [username]);
    
    useEffect(() => {
      if (viewTab === 'recipes' && !recipesLoaded && userData?.username) {
        loadRecipes(userData.username);
      }
    }, [viewTab, recipesLoaded, userData]);

    useEffect(() => {
      if (viewTab === 'cookbooks' && !cookbooksLoaded && userData?.username) {
        loadCookbooks(userData.username);
      }
    }, [viewTab, cookbooksLoaded, userData]);
    
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

    const handleCoverUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedProfile(prev => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
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
    
    const copyProfileLink = () => navigator.clipboard.writeText(`https://whiskaway.food/profile/${username || userData?.username}`).then(() => alert('Profile link copied!'));

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

    useEffect(() => {
      const openHandler = () => setShowNotifications(true);
      window.addEventListener('openNotificationsPanel', openHandler);
      return () => window.removeEventListener('openNotificationsPanel', openHandler);
    }, []);

    const renderScrollItem = (item, isCookbook) => (
      <div
        key={item._id}
        className="mx-2 w-[260px] h-[300px] rounded-xl overflow-hidden shadow hover:shadow-xl transition group bg-white"
      >
        <Link
          to={`/${isCookbook ? 'cookbook' : 'recipe'}/${item._id}`}
          className="block w-full h-full bg-gray-100"
        >
          <img
            src={
              isCookbook
                ? `/${item.coverImage || 'cover1.JPG'}`
                : item.image
                ? `data:image/jpeg;base64,${item.image}`
                : '/placeholder.jpg'
            }
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-lg font-semibold bg-black/60 px-4 py-2 rounded-lg text-center">
              {item.title}
            </div>
          </div>
        </Link>
      </div>
    );

    const items = viewTab === 'cookbooks' ? cookbooks : recipes;
    const isLoadingItems = viewTab === 'cookbooks' ? !cookbooksLoaded || loadingCookbooks : !recipesLoaded || loadingRecipes;
    const showArrows = items.length >= 3;

    const LeftArrow = ({ show }) => {
      const { scrollPrev } = React.useContext(VisibilityContext);
    
      const handleClick = (e) => {
        if (!show) {
          e.preventDefault();
          return;
        }
        scrollPrev();
      };
    
      return (
        <button
          onClick={handleClick}
          className={`text-2xl px-2 py-1 mr-2 rounded-md transition text-teal-700 ${
            show
              ? 'bg-[#f2faf9] hover:bg-teal-600/5'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          ◀
        </button>
      );
    };
    
    const RightArrow = ({ show }) => {
      const { scrollNext } = React.useContext(VisibilityContext);
    
      const handleClick = (e) => {
        if (!show) {
          e.preventDefault();
          return;
        }
        scrollNext();
      };
    
      return (
        <button
          onClick={handleClick}
          className={`text-2xl px-2 py-1 ml-2 rounded-md transition text-teal-700 ${
            show
              ? 'bg-[#f2faf9] hover:bg-teal-600/5'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          ▶
        </button>
      );
    };  

    const openNotifications = () =>
      window.dispatchEvent(new CustomEvent('openNotificationsPanel'));
      
    if (error) {
      return <p>{error}</p>;
    }
    
    return (
        <div className="pt-12 pb-10 profile-page">
          <div className="relative w-10/12 h-80 mb-52 rounded-lg">
          {loading ? (
            <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse rounded-lg z-0" />
          ) : (
            <img
              src={
                updatedProfile.coverImage
                  ? updatedProfile.coverImage
                  : userData?.coverImage
                    ? userData.coverImage
                    : '/cover_image.jpg'
              }
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover object-[center_18%] rounded-lg z-0"
            />
          )}

          {editMode && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 text-white text-sm font-medium cursor-pointer hover:bg-black/40 transition rounded-lg"
              >
                Click to upload cover photo
              </label>
            </>
          )}
          <div className="absolute bottom-[-5rem] left-0 right-0 mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-6">
          <div className="w-44 h-44 min-h-44 min-w-44 rounded-full overflow-hidden border-4 border-white bg-white relative translate-y-36 sm:translate-y-0 z-30">
            <img
              src={
                updatedProfile.profilePic
                  ? updatedProfile.profilePic
                  : userData?.profilePic
                    ? `data:image/jpeg;base64,${userData.profilePic}`
                    : '/user.png'
              }
              alt="Profile"
              className="w-full h-full object-cover aspect-square rounded-full"
            />

            {editMode && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-pic-upload"
                />
                <label
                  htmlFor="profile-pic-upload"
                  className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold cursor-pointer rounded-full"
                >
                  Upload Photo
                </label>
              </>
            )}
          </div>
              <div className="flex flex-col justify-end items-center sm:items-start h-44 relative translate-y-36 sm:translate-y-28 text-center sm:text-left">
                {editMode ? (
                  <>
                  <div className="flex items-center gap-2 mb-1">
                    <img src="/whiskaway.png" alt="Logo" className="w-5 h-5" />
                    <span className="text-gray-600 text-sm">{userData?.username}</span>
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
                    {!userData ? (
                      <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse z-50" />
                    ) : (
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {userData.fName} {userData.lName}
                      </h2>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <img src="/whiskaway.png" alt="Logo" className="w-5 h-5 object-contain" />
                      {userData?.username}
                    </div>
                    {!userData ? (
                      <div className="w-[300px] h-10 bg-gray-200 rounded-lg animate-pulse" />
                    ) : (
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
                    )}
                    <p className="text-gray-700 pt-1">
                    {loading ? (
                      <span className="inline-block h-4 w-24 bg-gray-200 rounded-lg animate-pulse" />
                    ) : loadingFriends ? (
                      '---'
                    ) : currentUser === userData?.username ? (
                      <Link
                        to="/settings?tab=manageFriends"
                        className="text-teal-600 hover:underline"
                      >
                        {friendCount} friend{friendCount !== 1 ? 's' : ''}
                      </Link>
                    ) : (
                      <span>
                        {friendCount} friend{friendCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={copyProfileLink}
                        className="bg-teal-500 hover:bg-teal-600 rounded-full px-4 py-2 font-semibold"
                      >
                        Share
                      </button>

                      {currentUser === userData?.username ? (
                        <button
                          onClick={handleEditToggle}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full px-4 py-2 font-semibold"
                        >
                          Edit Profile
                        </button>
                      ) : isFriend ? (
                        <button
                          disabled
                          className="bg-gray-300 rounded-full px-4 py-2 font-semibold cursor-default"
                        >
                          Friends ✓
                        </button>
                      ) : incomingRequest ? (
                        <button
                          onClick={openNotifications}
                          className="bg-green-200 hover:bg-green-300 rounded-full px-4 py-2 font-semibold"
                        >
                          Accept Request
                        </button>
                      ) : requestSent ? (
                        <button
                          disabled
                          className="bg-yellow-200 rounded-full px-4 py-2 font-semibold cursor-default"
                        >
                          Request Sent ✓
                        </button>
                      ) : (
                        <button
                          onClick={sendFriendRequest}
                          className="bg-green-200 hover:bg-green-300 rounded-full px-4 py-2 font-semibold"
                        >
                          Add Friend +
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <hr className="border-t border-gray-300 mt-32 mb-16 w-10/12 mx-auto translate-y-4 sm:translate-y-0" />
        <div className="w-full px-6 sm:px-32 pb-12 translate-y-4 sm:translate-y-0 overflow-x-hidden">
          <div className="mb-6">
            <div className="flex space-x-4">
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

          <div className="w-full px-4">
          {isLoadingItems ? (
            <ScrollMenu
              LeftArrow={<LeftArrow show={showArrows} />}
              RightArrow={<RightArrow show={showArrows} />}
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  itemID={`loading-${i}`}
                  className="relative mx-2 h-52 w-40 md:h-64 md:w-52 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </ScrollMenu>
          ) : items.length > 0 ? (
            <ScrollMenu
              LeftArrow={<LeftArrow show={showArrows} />}
              RightArrow={<RightArrow show={showArrows} />}
            >
              {items.map((item) => (
                <div
                  key={item._id}
                  itemID={item._id}
                  className="relative mx-2 h-52 w-40 md:h-64 md:w-52 rounded-xl overflow-hidden shadow hover:shadow-xl transition group bg-white"
                >
                  <Link
                    to={`/${viewTab === 'cookbooks' ? 'cookbook' : 'recipe'}/${item._id}`}
                    className="block w-full h-full bg-gray-100"
                  >
                    <img
                      src={
                        viewTab === 'cookbooks'
                          ? `/${item.coverImage || 'cover1.JPG'}`
                          : item.image
                          ? `data:image/jpeg;base64,${item.image}`
                          : '/placeholder.jpg'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm font-semibold px-3 py-2 rounded-xl">
                      {item.title}
                    </div>
                  </Link>
                </div>
              ))}
            </ScrollMenu>
          ) : (
            <p className="text-center text-gray-600">
              {viewTab === 'cookbooks' ? 'No public cookbooks yet.' : 'No public recipes yet.'}
            </p>
          )}
          </div>
        </div>
      </div>
    );
}

export default ProfilePage;