import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import SearchPage from './components/SearchPage/SearchPage';
import MessagePage from './components/MessagePage/MessagePage';
import RecipeBooksPage from './components/RecipeBooksPage/RecipeBooksPage';
import BottomNav from './components/BottomNav/BottomNav';
import ProfilePage from './components/ProfilePage/ProfilePage';
import TopBar from './components/TopBar/TopBar';

function App() {
    return (
        <BrowserRouter>
            <TopBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/messages" element={<MessagePage />} />
                <Route path="/recipe-books" element={<RecipeBooksPage />} />
            </Routes>
            <BottomNav />
        </BrowserRouter>
    );
}

export default App;
