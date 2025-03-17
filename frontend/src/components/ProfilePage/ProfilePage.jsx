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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await axios.get(username ? `/profile/${username}` : `/profile`);
                setUserData(profileRes.data);
    
                if (profileRes.data.username) {
                    const cookbooksRes = await axios.get(`/cookbooks/user/${profileRes.data.username}`);
                    const publicCookbooks = cookbooksRes.data.filter(cookbook => cookbook.isPublic);
                    setCookbooks(publicCookbooks);
                } else {
                    setCookbooks([]);
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!userData) return <p>No user data found.</p>;

    const copyProfileLink = () => {
        const profileLink = username
            ? `http://localhost:3000/profile/${username}`
            : `http://localhost:3000/profile/${userData.username}`
        navigator.clipboard.writeText(profileLink).then(() => {
            alert('Profile link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy the link');
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        if (!userData?.userInfo) {
            console.error("UserInfo ID not available:", userData);
            return;
        }
    
        const userId = userData.userInfo.toString(); // Ensure correct ID
    
        console.log("Uploading image for userInfo ID:", userId);
    
        const formData = new FormData();
        formData.append("profilePic", file);
        formData.append("userId", userId);
    
        try {
            const response = await axios.post("http://localhost:3000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            console.log("Upload Success:", response.data);
    
            // Fetch the updated image from the backend
            const imgRes = await axios.get(`http://localhost:3000/profilePic/${userId}`, { responseType: 'arraybuffer' });
    
            // Convert response to base64
            const fileReader = new FileReader();
            fileReader.readAsDataURL(new Blob([imgRes.data]));
            fileReader.onloadend = () => {
                setUserData((prev) => ({ ...prev, profilePic: fileReader.result }));
            };
        } catch (error) {
            console.error("Upload failed:", error.response ? error.response.data : error.message);
        }
    };
    
    
    return (
        <div className="profile-line back">
            <div className="profile-page">
                <div className="relative inline-block">
                    <input
                        type="file"
                        id="profile-pic-input"
                        className="absolute opacity-0"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <label htmlFor="profile-pic-input" className="block w-36 h-36 rounded-full overflow-hidden border border-gray-200 mb-1">
                    <img
                        id="profile-pic-preview"
                        src={userData.profilePic ? userData.profilePic : "/profilepic.jpg"}
                        alt="Profile Pic"
                        className="object-cover w-full h-full"
                    />
                    </label>
                </div>

                <div className="profile-details text-center">
                    <span className="font-semibold text-2xl">{userData.fName} {userData.lName}</span>
                    <p className="flex items-center justify-center gap-2 pt-2">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                        <span className="text-sm font-medium">{userData.username}</span>
                    </p>
                    <p>{userData.friends?.length || 0} friends</p>
                    <p className="bio-section">{userData.bio}</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <button 
                            onClick={copyProfileLink} 
                            className="bg-blue-200 rounded-full px-4 py-2 font-semibold"
                        >
                            Share
                        </button>
                        <button className="bg-blue-200 rounded-full px-4 py-2 font-semibold">Edit profile</button>
                    </div>
                </div>
            </div>
            <hr className="border-t-1 border-gray-200 my-4" />
            <div className="cookbook-profile">
                <div className="my-6">
                    <span className="text-xl">
                        {userData.username}'s Public Cookbooks
                    </span>
                </div>
                <div className="recipe-list">
                    {cookbooks.length > 0 ? (
                        cookbooks.map((cookbook) => (
                            <div key={cookbook._id} className="cookbook-card">
                                <Link to={`/cookbook/${cookbook._id}`}>
                                    <h3>{cookbook.title}</h3>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p>No cookbooks created yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
