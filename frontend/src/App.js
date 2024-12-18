import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import CreatePage from './components/CreatePage/CreatePage';
import MessagePage from './components/MessagePage/MessagePage';
import RecipeBooksPage from './components/RecipeBooksPage/RecipeBooksPage';
import BottomNav from './components/BottomNav/BottomNav';
import ProfilePage from './components/ProfilePage/ProfilePage';
import RecipeDetailPage from './components/RecipeDetailPage/RecipeDetailPage';
import TopBar from './components/TopBar/TopBar';

function App() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <BrowserRouter>
            <TopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <Routes>
                <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
                <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                <Route path="/add-recipe" element={<CreatePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/messages" element={<MessagePage />} />
                <Route path="/recipe-books" element={<RecipeBooksPage />} />
            </Routes>
            <BottomNav />
        </BrowserRouter>
    );
}

export default App;
