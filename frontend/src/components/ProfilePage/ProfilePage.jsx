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
    const [updatedProfile, setUpdatedProfile] = useState({ fName: '', lName: '', bio: '', profilePic: null });
    const [isFriend, setIsFriend] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [userInfoId, setUserInfoId] = useState(null);
    const [friendCount, setFriendCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await axios.get(username ? `/profile/${username}` : `/profile`);
                const currentUserRes = await axios.get(`/profile`);
                setUserData(profileRes.data);

                const friendsRes = await axios.get(`/friends/${profileRes.data.userInfo}`);
                setFriendCount(friendsRes.data.length || 0);

                setUpdatedProfile({
                fName: profileRes.data.fName,
                lName: profileRes.data.lName,
                bio: profileRes.data.bio,
                profilePic: profileRes.data.profilePic,
                });

                setCurrentUser(currentUserRes.data.username);
                if (profileRes.data.username) {
                    const cookbooksRes = await axios.get(`/cookbooks/user/${profileRes.data.username}`);
                    setCookbooks(cookbooksRes.data.filter(cookbook => cookbook.isPublic));
                }
                setUserInfoId(currentUserRes.data.userInfo);

                if (profileRes.data.userInfo !== currentUserRes.data.userInfo) {
                    const recipientInfo = await axios.get(`/friend-requests/${profileRes.data.userInfo}`);
                    const alreadySent = recipientInfo.data.some(req => req._id === currentUserRes.data.userInfo);
                    setRequestSent(alreadySent);

                    const friendsList = await axios.get(`/friends/${currentUserRes.data.userInfo}`);
                    
                    const alreadyFriend = friendsList.data.some(
                        friend => friend.userInfo?.toString() === profileRes.data.userInfo?.toString()
                      );
                                          
                    setIsFriend(alreadyFriend);
                }
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
            await axios.put(`/profile/update`, updatedProfile);
            setUserData(prev => ({ ...prev, ...updatedProfile }));
            setEditMode(false);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };
    
    const copyProfileLink = () => navigator.clipboard.writeText(`http://localhost:3000/profile/${username || userData.username}`).then(() => alert('Profile link copied!'));

    const sendFriendRequest = async () => {
        try {
          await axios.post('/friend-request', {
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
        <div className="back profile-page">
            <div className="relative inline-block">
                {editMode ? (
                    <>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profile-pic-upload" />
                        <label htmlFor="profile-pic-upload" className="block w-36 h-36 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
                            <img src={updatedProfile.profilePic || userData.profilePic || '/profilepic.jpg'} alt="Profile" className="object-cover w-full h-full" />
                        </label>
                    </>
                ) : (
                    <img src={userData.profilePic || '/profilepic.jpg'} alt="Profile" className="w-36 h-36 rounded-full border border-gray-200" />
                )}
            </div>
            <div className="profile-details text-center">
                {editMode ? (
                    <div className="flex flex-col items-center">
                        <p className="flex items-center justify-center gap-2 pb-2">
                            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                            <span className="text-sm font-medium">{userData.username}</span>
                        </p>
                        <input name="fName" value={updatedProfile.fName} onChange={handleInputChange} className="border px-2 py-1 rounded-xl mb-2" />
                        <input name="lName" value={updatedProfile.lName} onChange={handleInputChange} className="border px-2 py-1 rounded-xl mb-2" />
                        <textarea name="bio" value={updatedProfile.bio} onChange={handleInputChange} className="border px-2 py-1 rounded-xl mb-2"></textarea>
                        <div className="flex gap-4 mt-2">
                            <button onClick={handleSave} className="bg-blue-200 rounded-full px-4 py-2 font-semibold">Save</button>
                            <button onClick={handleEditToggle} className="bg-gray-300 rounded-full px-4 py-2 font-semibold">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold">{userData.fName} {userData.lName}</h2>
                        <p className="flex items-center justify-center gap-2 pt-2">
                            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                            <span className="text-sm font-medium">{userData.username}</span>
                        </p>
                        <p className="text-gray-600">{userData.bio}</p>
                        <p>{friendCount} friend{friendCount === 1 ? '' : 's'}</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={copyProfileLink} className="bg-blue-200 rounded-full px-4 py-2 font-semibold">Share</button>

                            {currentUser === userData.username ? (
                                <button onClick={handleEditToggle} className="bg-blue-200 rounded-full px-4 py-2 font-semibold">
                                    Edit Profile
                                </button>
                            ) : isFriend ? (
                                <button disabled className="bg-gray-300 rounded-full px-4 py-2 font-semibold cursor-default">
                                    Friends ✓
                                </button>
                            ) : requestSent ? (
                                <button disabled className="bg-yellow-200 rounded-full px-4 py-2 font-semibold cursor-default">
                                    Request Sent ✓
                                </button>
                            ) : (
                                <button onClick={sendFriendRequest} className="bg-green-200 rounded-full px-4 py-2 font-semibold">
                                    Add Friend +
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            <hr className="border-t border-gray-200 my-4 w-full" />
            <div className="cookbook-profile">
                <div className="my-6">
                    <span className="text-xl">{userData.fName}'s Cookbooks</span>
                </div>
                <div className="recipe-list">
                    {cookbooks.length > 0 ? cookbooks.map(cookbook => (
                        <div key={cookbook._id} className="cookbook-card">
                            <Link to={`/cookbook/${cookbook._id}`}><h3>{cookbook.title}</h3></Link>
                        </div>
                    )) : <p>No cookbooks created yet.</p>}
                </div>
            </div>
        </div>
    );
}
export default ProfilePage;