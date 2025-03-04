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

    return (
        <div className="cookbook-page p-6">
            <h1 className="text-2xl font-semibold mb-6">Create a New Cookbook</h1>
            
            <div className="create-cookbook mb-6">
                <input
                    type="text"
                    placeholder="Enter Cookbook Title"
                    value={newCookbookTitle}
                    onChange={(e) => setNewCookbookTitle(e.target.value)}
                    className="p-3 w-full border border-gray-300 rounded-lg mb-4"
                />
                
                <div className="flex items-center mb-4">
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
            
            <div className="recipe-list mt-8">
                <h2 className="text-xl font-semibold mb-4">Your Cookbooks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cookbooks.length > 0 ? (
                        cookbooks.map((cookbook) => (
                            <div key={cookbook._id} className="cookbook-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                                <Link to={`/cookbook/${cookbook._id}`} className="text-xl font-medium mb-2 block">{cookbook.title}</Link>
                                <button
                                    onClick={() => toggleCookbookPrivacy(cookbook._id, cookbook.isPublic)}
                                    className={`w-full py-2 rounded-lg ${cookbook.isPublic ? 'bg-red-500' : 'bg-green-500'} text-white hover:${cookbook.isPublic ? 'bg-red-600' : 'bg-green-600'} transition duration-200`}
                                >
                                    {cookbook.isPublic ? 'Make Private' : 'Make Public'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No cookbooks created yet. Create one above!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CookbookPage;