// client/src/components/User/SignUp.js
import React, { useState } from 'react';

function SignUp({ onSignUp }) {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login submitted:', { user, password });
        onSignUp();
    };

    return (
        <div className="sign-up">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit} className="sign-up-form">
                <div className="form-group">
                    <label htmlFor="user">Email/Username:</label>
                    <input
                        type="text"
                        id="user"
                        placeholder="Email/Username"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
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
            </form>
        </div>
    );
}

export default SignUp;
