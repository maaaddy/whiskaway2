import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import SearchPage from './components/SearchPage/SearchPage';
import MessagePage from './components/MessagePage/MessagePage';
import RecipeBooksPage from './components/RecipeBooksPage/RecipeBooksPage';
import BottomNav from './components/BottomNav/BottomNav';
import ProfilePage from './components/ProfilePage/ProfilePage';
import TopBar from './components/TopBar/TopBar';
import SignUp from './components/User/SignUp';
import Login from './components/User/Login';
import GetStarted from './components/User/GetStarted';

function App() {
<<<<<<< Updated upstream
    return (
        <BrowserRouter>
            <TopBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/messages" element={<MessagePage />} />
                <Route path="/recipe-books" element={<RecipeBooksPage />} />
=======
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
        <BrowserRouter>
            {isLoggedIn && <TopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onLogout={handleLogout} />}
            <Routes>
                <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <GetStarted />} />

                <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
                <Route path="/signup" element={<SignUp onSignUp={() => setIsLoggedIn(true)} />} />

                {isLoggedIn ? ( 
                    <>
                        <Route path="/home" element={<HomePage searchQuery={searchQuery} />} />
                        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                        <Route path="/add-recipe" element={<CreatePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/messages" element={<MessagePage />} />
                        <Route path="/recipe-books" element={<RecipeBooksPage />} />
                    </>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
>>>>>>> Stashed changes
            </Routes>
            {isLoggedIn && <BottomNav />}
        </BrowserRouter>
    );
}

export default App;
