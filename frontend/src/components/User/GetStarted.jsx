import React from 'react';
import { useNavigate } from 'react-router-dom';

function GetStarted() {
    const navigate = useNavigate();

    const handleSignUp = () => {
        navigate('/signup');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="get-started">
            <h1>Let's Get Started!</h1>
            <div className="button-container">
                <button onClick={handleSignUp} className="sign-up-button">
                    Sign Up
                </button>
                <button onClick={handleLogin} className="login-button">
                    Log In
                </button>
            </div>
        </div>
    );
}

export default GetStarted;
