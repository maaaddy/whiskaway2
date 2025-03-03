import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CookbookPage() {
    const [newCookbookTitle, setNewCookbookTitle] = useState('');
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
            const response = await axios.post('/cookbook', { title: newCookbookTitle });
            setCookbooks([...cookbooks, response.data]);
            setNewCookbookTitle('');
        } catch (err) {
            console.error('Error creating cookbook:', err);
        }
    };

    return (
        <div className="cookbook-page pt-20">
            <h1>Create a New Cookbook</h1>
            <div className="create-cookbook">
                <input
                    type="text"
                    placeholder="Enter Cookbook Title"
                    value={newCookbookTitle}
                    onChange={(e) => setNewCookbookTitle(e.target.value)}
                />
                <button onClick={handleCreateCookbook}>Create Cookbook</button>
            </div>
            <div className="recipe-list">
                <h2>Your Cookbooks</h2>
                {cookbooks.length > 0 ? (
                    cookbooks.map((cookbook) => (
                        <div key={cookbook._id} className="cookbook-card">
                            <Link to={`/cookbook/${cookbook._id}`}>
                                <h3>{cookbook.title}</h3>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No cookbooks created yet. Create one above!</p>
                )}
            </div>
        </div>
    );
}

export default CookbookPage;
