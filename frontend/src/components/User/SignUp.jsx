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
        <div className="sign-up">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit} className="sign-up-form">
                <div className="form-group">
                    <label htmlFor="user">Username:</label>
                    <input
                        type="text"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="fName">First Name:</label>
                    <input
                        type="text"
                        id="fName"
                        placeholder="Enter your first name"
                        value={fName}
                        onChange={(e) => setFName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lName">Last Name:</label>
                    <input
                        type="text"
                        id="lName"
                        placeholder="Enter your last name"
                        value={lName}
                        onChange={(e) => setLName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lName">Bio:</label>
                    <input
                        type="text"
                        id="bio"
                        placeholder="Write a bio for your profile"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>
                <button type="submit" className="sign-up-button">
                    Sign Up
                </button>
                <div>Don't have an account?</div>
                <Link to="/login">
                    Log in
                </Link>
            </form>
        </div>
    );
}

export default SignUp;