import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Select from 'react-select';

const intoleranceOptions = [
    { value: "dairy", label: "Dairy-Free" },
    { value: "egg", label: "Egg-Free" },
    { value: "gluten", label: "Gluten-Free" },
    { value: "grain", label: "Grain-Free" },
    { value: "peanut", label: "Peanut-Free" },
    { value: "seafood", label: "Seafood-Free" },
    { value: "sesame", label: "Sesame-Free" },
    { value: "shellfish", label: "Shellfish-Free" },
    { value: "soy", label: "Soy-Free" },
    { value: "sulfite", label: "Sulfite-Free" },
    { value: "tree nut", label: "Tree Nut-Free" },
    { value: "wheat", label: "Wheat-Free" }
];

function SignUp({ onSignUp }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fName, setFName] = useState('');
    const [lName, setLName] = useState('');
    const [bio, setBio] = useState('');
    const [intolerances, setIntolerances] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const intoleranceValues = intolerances.map(item => item.value);
            const { data } = await axios.post('/register', { username, password, fName, lName, bio, intolerances: intoleranceValues });
            if (data.error) {
                console.log(data.error);
            } else {
                setUsername('');
                setPassword('');
                setFName('');
                setLName('');
                setBio('');
                setIntolerances([]);
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
            className="flex bg-cover bg-center min-h-screen"
            style={{ backgroundImage: "url('/background_whiskaway.jpg')" }}
        >
            <div 
                className="md:w-2/5 w-full flex flex-col justify-center items-center p-8 text-gray-800 md:ml-10 shadow-2xl relative backdrop-blur-sm bg-white bg-opacity-70"
            >
                <div className="logo pb-2">
                    <img src="/logo.png" alt="Logo" className="w-28 h-auto" />
                </div>
                <h1 className="text-5xl font-extrabold mb-4 text-teal-700 drop-shadow-lg">WhiskAway</h1>
                <p className="text-md text-center mb-8 text-gray-700 drop-shadow-md">
                    Your place to find, create, and share recipes!
                </p>
                <span className='text-center text-xl font-extrabold text-teal-700 drop-shadow-lg mb-2'>Sign Up</span>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full px-6">
                    <div className="form-group">
                        <label htmlFor="username" className="text-gray-700">Username:</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="form-group md:flex gap-4">
                        <div className="w-full">
                            <label htmlFor="fName" className="text-gray-700">First Name:</label>
                            <input
                                type="text"
                                id="fName"
                                placeholder="First Name"
                                value={fName}
                                onChange={(e) => setFName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="w-full mt-4 md:mt-0">
                            <label htmlFor="lName" className="text-gray-700">Last Name:</label>
                            <input
                                type="text"
                                id="lName"
                                placeholder="Last Name"
                                value={lName}
                                onChange={(e) => setLName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="form-group md:flex gap-4">
                        <div className="w-full">
                            <label htmlFor="bio" className="text-gray-700">Bio:</label>
                            <input
                                type="text"
                                id="bio"
                                placeholder="Write a bio for your profile"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="w-full mt-4 md:mt-0">
                            <label htmlFor="intolerance" className="text-gray-700">Allergies/Intolerances:</label>
                            <Select
                                isMulti
                                name="intolerances"
                                options={intoleranceOptions}
                                className="basic-multi-select rounded"
                                classNamePrefix="select"
                                value={intolerances}
                                onChange={setIntolerances}
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full px-6 py-2 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-transform transform hover:scale-105 duration-300"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="mt-3 text-center text-gray-700">
                    <span>Already have an account?</span>
                    <Link to="/login" className="text-teal-500 font-semibold"> Log In</Link>
                </div>
            </div>
            <div className="flex-1"></div>
        </div>
    );
}

export default SignUp;