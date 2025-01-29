// client/src/components/MessagePage.js

import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function MessagePage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    //display name, dietary (T/F) food allergies (T/F), Bio/About me
    //profile picture
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/register', { username, password });
            if (data.error) {
                console.log(data.error);
            } else {
                setUsername('');
                setPassword('');
                localStorage.setItem('token', data.token);
                //onSignUp();
                navigate('/home');
            }
        } catch (error) {
            console.error('Error signing up:', error);
        }
    };
    return (
        <div className="sign-up">
            <h3>Registration</h3>
            <p>Tell us about yourself! This will be displayed on your profile.</p> 
            <form onSubmit={handleSubmit} className="sign-up-form mt-5">
                <div className="form-group my-2">
                    <p>Add profile picture insert here...</p>
                    <label htmlFor="fName">First Name* </label>
                    <input
                        type="text"
                        id="fName"
                        placeholder="Enter First Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label htmlFor="lName">Last name </label>
                    <input
                        type="text"
                        id="lName"
                        placeholder="Enter Last Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="bio">About Me: </label>
                    <input
                        type="text"
                        id="about"
                        cols="30"
                        rows="10"
                        placeholder="Talk about yourself here"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="form-group my-5">
                    <p>This section is private, and not-required, but recommended for best experience.</p> 
                    <p>Put Yes/No button options for food allergies</p> 
                    <p>Put Yes/No button options for dietary restrictions</p> 
                    <label htmlFor="allergies">Allergies* </label>
                    <select name="allergies" id="allergies">
                        <option value="na"></option>
                        <option value="nut">No</option>
                        <option value="nut">Yes</option>
                    </select>
                </div>
                <button type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default MessagePage;
