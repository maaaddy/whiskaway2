import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import CreatePage from './components/CreatePage/CreatePage';
import About from './components/About';
import ChatPage from './components/ChatPage/ChatPage';
import CookbookPage from './components/CookbookPage/CookbookPage';
import CookbookDetailPage from './components/CookbookDetailPage/CookbookDetailPage';
import BottomNav from './components/BottomNav/BottomNav';
import ProfilePage from './components/ProfilePage/ProfilePage';
import RecipeDetailPage from './components/RecipeDetailPage/RecipeDetailPage';
import TopBar from './components/TopBar/TopBar';
import SignUp from './components/User/SignUp';
import Login from './components/User/Login';
import GetStarted from './components/User/GetStarted';
import axios from 'axios';
import NotificationsPage from './components/NotificationsPage/NotificationsPage';
import { UserContextProvider } from "./context/UserContext";

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [recipeFilter, setRecipeFilter] = useState("all");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            setIsLoggedIn(false);
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <UserContextProvider>
            <BrowserRouter>
                {isLoggedIn && <TopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} setRecipeFilter={setRecipeFilter} onLogout={handleLogout} />}
                <Routes>
                    {isLoggedIn ? ( 
                        <>
                            <Route path="/" element={<HomePage searchQuery={searchQuery} recipeFilter={recipeFilter} />} />
                            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                            <Route path="/add-recipe" element={<CreatePage />} />
                            <Route path="/profile/:username?" element={<ProfilePage />} />
                            <Route path="/messages" element={<ChatPage />} />
                            <Route path="/cookbook" element={<CookbookPage />} />
                            <Route path="/cookbook/:id" element={<CookbookDetailPage />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <GetStarted />} />
                            <Route path="/login" element={<Login onLogin={handleLogin} />} />
                            <Route path="/signup" element={<SignUp onSignUp={handleLogin} />} />
                            <Route path="*" element={<GetStarted />} />
                        </>
                    )}
                </Routes>
                {isLoggedIn && <BottomNav />}
            </BrowserRouter>
        </UserContextProvider>
    );
}

export default App;
