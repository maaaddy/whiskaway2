import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CookbookPage() {
    const [newCookbookTitle, setNewCookbookTitle] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [cookbooks, setCookbooks] = useState([]);

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
        } catch (err) {
            console.error('Error creating cookbook:', err);
        }
    };

    const toggleCookbookPrivacy = async (id, currentIsPublic) => {
        try {
            const newPrivacyStatus = !currentIsPublic;
            await axios.put(`/cookbook/${id}`, { isPublic: newPrivacyStatus });

            setCookbooks(cookbooks.map(cookbook =>
                cookbook._id === id ? { ...cookbook, isPublic: newPrivacyStatus } : cookbook
            ));
        } catch (err) {
            console.error('Error updating cookbook privacy:', err);
        }
    };

    const handleDeleteCookbook = async (id) => {
        console.log(`Delete cookbook with id: ${id}`);
    };

    return (
        <div className="back cookbook-page p-6">
            <h1 className="text-2xl text-center font-semibold mt-4">My Cookbooks</h1>
            <hr className="border-t-1 border-gray-200 my-4" />

            <div className="recipe-list mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cookbooks.length > 0 ? (
                        cookbooks.map((cookbook) => (
                            <div key={cookbook._id} className="cookbook-card bg-blue-400 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 relative flex flex-col justify-between h-64">
                                <button 
                                    onClick={() => handleDeleteCookbook(cookbook._id)} 
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition duration-200"
                                >
                                    ❌
                                </button>
                                <Link to={`/cookbook/${cookbook._id}`} className="text-xl font-medium mb-2 block">{cookbook.title}</Link>
                                <button
                                    onClick={() => toggleCookbookPrivacy(cookbook._id, cookbook.isPublic)}
                                    className={`absolute bottom-2 right-2 py-1 px-3 text-sm rounded-full ${cookbook.isPublic ? 'bg-red-500' : 'bg-green-500'} text-white hover:${cookbook.isPublic ? 'bg-red-600' : 'bg-green-600'} transition duration-200`}
                                >
                                    {cookbook.isPublic ? 'Make Private' : 'Make Public'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-teal-700 font-semibold">No cookbooks created yet. Create one below!</p>
                    )}

                    <div className="create-cookbook-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex flex-col justify-between h-64">
                        <h3 className="text-xl font-medium mb-2 text-center">Create a New Cookbook</h3>
                        <input
                            type="text"
                            placeholder="Enter Cookbook Title"
                            value={newCookbookTitle}
                            onChange={(e) => setNewCookbookTitle(e.target.value)}
                            className="p-3 w-full border border-gray-300 rounded-lg mb-4"
                        />
                        
                        <div className="flex items-center mb-4 justify-center">
                            <input 
                                type="checkbox" 
                                checked={isPublic} 
                                onChange={() => setIsPublic(!isPublic)} 
                                className="mr-2"
                            />
                            <span>{isPublic ? 'Make Public' : 'Keep Private'}</span>
                        </div>

                        <button 
                            onClick={handleCreateCookbook} 
                            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
                        >
                            Create Cookbook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CookbookPage;