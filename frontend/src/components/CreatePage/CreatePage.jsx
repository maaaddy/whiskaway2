// client/src/components/CreatePage/CreatePage.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CreatePage() {
    const [recipes, setRecipes] = useState([]);
    const [title, setTitle] = useState('');
    const [servings, setServings] = useState('');

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        try {
            const newRecipe = { 
                title, 
                servings, 
            };
            const response = await axios.post('/recipes', newRecipe);
            setRecipes([...recipes, { ...response.data}]);
        } catch (err) {
            console.error('Error submitting recipe:', err);
        }
    };

    return (
        <div className="create-page">
            <h1>Create Recipes!</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={title}
                        onChange={(ev) => setTitle(ev.target.value)}
                        type="text"
                        placeholder="Title"
                        className="mt-3 block bg-blue-50 border border-blue-400 rounded-sm shadow shadow-gray mx-auto w-80 p-3 mb-2 resize-none overflow-y-auto"
                        style={{ height: '50px' }}
                    />
                    <textarea
                        value={servings}
                        onChange={(ev) => setServings(ev.target.value)}
                        placeholder="Serving size"
                        className="block bg-blue-50 border border-blue-400 rounded-sm shadow shadow-gray mx-auto w-80 p-3 mb-4 resize-none overflow-y-auto"
                    />

                    <button
                        type="submit"
                        className="bg-blue-200 border border-blue-400 block w-1/2 mx-auto rounded-sm shadow shadow-gray m-2 text-blue-800"
                        >
                        Submit
                    </button>
                </form>

            </div>
            
        </div>
    );
}

export default CreatePage;
