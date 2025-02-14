import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function SignUp({ onSignUp }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fName, setFName] = useState('');
    const [lName, setLName] = useState('');
    const [bio, setBio] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/register', { username, password, fName, lName, bio });
            if (data.error) {
                console.log(data.error);
            } else {
                setUsername('');
                setPassword('');
                setFName('');
                setLName('');
                setBio('');
                localStorage.setItem('token', data.token);
                onSignUp();
                navigate('/home');
            }
        } catch (error) {
            console.error('Error signing up:', error);
        }
    };

    return (
        <div 
            className="flex bg-cover bg-center relative"
            style={{ backgroundImage: "url('/background_whiskaway.jpg')" }}
        >
            <div 
                className="md:w-2/5 w-full flex flex-col justify-center items-center p-10 text-gray-800 md:ml-10 shadow-2xl relative backdrop-blur-sm bg-white bg-opacity-70"
            >
                <div className="logo pb-2">
                    <img src="/logo.png" alt="Logo" className="w-28 h-auto" />
                </div>
                <h1 className="text-6xl font-extrabold mb-6 text-teal-700 drop-shadow-lg">WhiskAway</h1>
                <p className="text-lg text-center mb-12 text-gray-700 drop-shadow-md">
                    Your place to find, create, and share recipes!
                </p>
                <span className='text-center text-xl font-extrabold text-teal-700 drop-shadow-lg relative mb-2'>Sign Up</span>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full px-8">
                    <div className="form-group">
                        <label htmlFor="username" className="text-gray-700">Username:</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-6 py-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="text-gray-700">Password:</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-6 py-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fName" className="text-gray-700">First Name:</label>
                        <input
                            type="text"
                            id="fName"
                            placeholder="Enter your first name"
                            value={fName}
                            onChange={(e) => setFName(e.target.value)}
                            required
                            className="w-full px-6 py-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lName" className="text-gray-700">Last Name:</label>
                        <input
                            type="text"
                            id="lName"
                            placeholder="Enter your last name"
                            value={lName}
                            onChange={(e) => setLName(e.target.value)}
                            required
                            className="w-full px-6 py-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lName" className="text-gray-700">Bio:</label>
                        <input
                            type="text"
                            id="bio"
                            placeholder="Write a bio for your profile"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-6 py-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full px-6 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-transform transform hover:scale-105 duration-300"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="mt-4 text-center text-gray-700">
                    <span>Already have an account?</span>
                    <Link to="/login" className="text-teal-500 font-semibold"> Log In</Link>
                </div>
            </div>
            <div className="flex-1 min-h-screen"></div>
        </div>
    );
}

export default SignUp;