import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaLock, FaLockOpen } from 'react-icons/fa';

function CookbookPage() {
    const [cookbooks, setCookbooks] = useState([]);
    const [view, setView] = useState('cookbooks');
    const [newCookbookTitle, setNewCookbookTitle] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        const fetchCookbooks = async () => {
            try {
                const response = await axios.get('/cookbook');
                setCookbooks(response.data);
            } catch (err) {
                console.error('Error fetching cookbooks:', err);
            }
        };
        fetchCookbooks();
    }, []);

    const handleCreateCookbook = async () => {
        if (!newCookbookTitle) return;

        try {
            const response = await axios.post('/cookbook', {
                title: newCookbookTitle,
                isPublic,
            });

            setCookbooks([...cookbooks, response.data]);
            setNewCookbookTitle('');
            setIsPublic(false);
            setView('cookbooks');
        } catch (err) {
            console.error('Error creating cookbook:', err);
        }
    };

    const handleDeleteCookbook = async (id) => {
        try {
            await axios.delete(`/cookbook/${id}`);
            setCookbooks(cookbooks.filter(cookbook => cookbook._id !== id));
        } catch (err) {
            console.error('Error deleting cookbook:', err);
        }
    };

    const togglePrivacy = async (id, currentStatus) => {
        try {
            const updatedCookbook = await axios.put(`/cookbook/${id}`, { isPublic: !currentStatus });
            setCookbooks(cookbooks.map(cookbook => 
                cookbook._id === id ? { ...cookbook, isPublic: updatedCookbook.data.isPublic } : cookbook
            ));
        } catch (err) {
            console.error('Error updating cookbook privacy:', err);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Cookbooks</h1>
            
            <div className="flex justify-center space-x-8 mb-6">
                <button 
                    className={`text-lg font-medium pb-2 ${view === 'cookbooks' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'} transition`} 
                    onClick={() => setView('cookbooks')}
                >
                    Cookbooks
                </button>
                <button 
                    className={`text-lg font-medium pb-2 ${view === 'create' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'} transition`} 
                    onClick={() => setView('create')}
                >
                    Create
                </button>
            </div>

            {view === 'create' ? (
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create a New Cookbook</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Cookbook Title</label>
                        <input 
                            type="text" 
                            placeholder="Enter title..." 
                            value={newCookbookTitle} 
                            onChange={(e) => setNewCookbookTitle(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <label className="text-gray-700 font-medium">Privacy</label>
                        <button 
                            onClick={() => setIsPublic(!isPublic)} 
                            className="flex items-center text-gray-700 hover:text-gray-900 transition"
                        >
                            {isPublic ? <FaLockOpen size={22} className="mr-2" /> : <FaLock size={22} className="mr-2" />}
                            {isPublic ? 'Public' : 'Private'}
                        </button>
                    </div>
                    <button 
                        onClick={handleCreateCookbook} 
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Create Cookbook
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cookbooks.length > 0 ? (
                        cookbooks.map((cookbook) => (
                            <div key={cookbook._id} className="relative bg-gray-100 rounded-lg shadow-md p-4 hover:shadow-lg transition">
                                <button 
                                    onClick={() => handleDeleteCookbook(cookbook._id)} 
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                                >
                                    ❌
                                </button>
                                <button 
                                    onClick={() => togglePrivacy(cookbook._id, cookbook.isPublic)} 
                                    className="absolute bottom-2 right-2 text-gray-700 hover:text-gray-900 transition"
                                >
                                    {cookbook.isPublic ? <FaLockOpen size={20} /> : <FaLock size={20} />}
                                </button>
                                <Link to={`/cookbook/${cookbook._id}`}>
                                    <div className="h-40 bg-gray-300 rounded-lg mb-3 flex items-center justify-center">
                                        <span className="text-gray-500">Cover Photo TBD</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700">{cookbook.title}</h3>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-700">No cookbooks created yet. Click "Create Cookbook" to add one.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default CookbookPage;