import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfilePage() {
    const [userData, setUserData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        axios
            .get('/profile', { withCredentials: true })
            .then((response) => {
                setUserData(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load profile data');
                setLoading(false);
            });
    }, []);

    const previewProfilePic = (e) => {
        e.preventDefault();
        const input = e.target;
        const preview = document.getElementById('profile-pic-preview');
    
        if (input.files && input.files[0]) {
          const reader = new FileReader();
    
          reader.onload = function(e) {
            preview.src = e.target.result;
          }
    
          reader.readAsDataURL(input.files[0]);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!userData) return <p>No user data found. Please log in.</p>;

    return (
        <div className="profile-line back">
            <div className="profile-page">
                <div className="relative inline-block">
                    <input
                        type="file"
                        id="profile-pic-input"
                        className="absolute opacity-0"
                        accept="image/*"
                        onChange={previewProfilePic}
                    />
                    <label htmlFor="profile-pic-input" className="block w-36 h-36 rounded-full overflow-hidden border border-black mb-1">
                        <img
                            id="profile-pic-preview"
                            src={userData.profilePic || "#"}
                            alt="Profile Pic"
                            className="object-cover w-full h-full"
                        />
                    </label>
                </div>

                <div className="profile-details text-center">  
                    <span className='font-semibold text-2xl'>{userData.fName} {userData.lName}</span>
                    <p className="flex items-center justify-center gap-2 pt-2">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" /> 
                        <span className="text-sm font-medium">{userData.username}</span>
                    </p>
                    <p>{userData.friends?.length || 0} friends</p>
                    <p className='bio-section'>{userData.bio}</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <button className="bg-blue-200 rounded-full px-4 py-2 font-semibold">Share</button>
                        <button className="bg-blue-200 rounded-full px-4 py-2 font-semibold">Edit profile</button>
                    </div>
                </div>
            </div>
            <hr className="border-t-1 border-gray-200 my-4" />
            <div className='cookbook-profile'>
                <div className='my-6'>
                    <span className='text-xl'>My Cookbooks</span>
                </div>

            </div>

        </div>
    );
}

export default ProfilePage;
