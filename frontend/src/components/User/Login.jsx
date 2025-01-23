// frontend/src/components/User/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const {data} = await axios.post('/login', {username, password});
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
        <div className="login">
            <h1>Log in</h1>
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
                    Log in
                </button>
                <div>Already have an account?</div>
                <Link to ="/signup">
                    Sign Up
                </Link>
            </form>
        </div>
    );
}

export default Login;
