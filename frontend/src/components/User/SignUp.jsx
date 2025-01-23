import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/register', { username, password });
            if (data.error) {
                console.log(data.error);
            } else {
                setUsername('');
                setPassword('');
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