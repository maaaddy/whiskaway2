import React, { useState } from 'react';
import axios from 'axios';

function CreatePage() {
    const [recipes, setRecipes] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [link, setLink] = useState('');
    const [servings, setServings] = useState('');

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setImage(file);
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        try {
            const newRecipe = { title, description, servings, link, image };
            const response = await axios.post('/recipes', newRecipe);
            setRecipes([...recipes, response.data]);
        } catch (err) {
            console.error('Error submitting recipe:', err);
        }
    };

    return (
        <div className='back'>
        <div className="max-w-screen-lg mx-auto p-6 flex flex-col">
            <div className="flex flex-col md:flex-row gap-8 mt-6 items-start">
    
                <div className="w-full md:w-1/2 flex pr-5">
                    <div className="w-full h-[350px] border border-dashed border-gray-400 flex items-center justify-center bg-gray-100 rounded-3xl">
                        {image ? (
                            <img src={URL.createObjectURL(image)} alt="Preview" className="h-full w-full object-cover rounded-3xl" />
                        ) : (
                            <label className="cursor-pointer text-gray-500 text-center w-full h-full flex flex-col items-center justify-center">
                                Drag & Drop or  
                                <span className="text-teal-500 font-medium">Select a File</span>
                                <input type="file" className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex flex-col">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-gray-700 font-medium">Title</label>
                            <input
                                type="text"
                                id="title"
                                placeholder="Recipe title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-gray-700 font-medium">Description</label>
                            <textarea
                                id="description"
                                placeholder="Add a description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                            />
                        </div>
                        <div>
                            <label htmlFor="servings" className="block text-gray-700 font-medium">Serving Size</label>
                            <input
                                type="text"
                                id="servings"
                                placeholder="e.g. 4 servings"
                                value={servings}
                                onChange={(e) => setServings(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                            />
                        </div>
                        <div>
                            <label htmlFor="link" className="block text-gray-700 font-medium"> Link</label>
                            <input
                                type="text"
                                id="link"
                                placeholder="e.g. https://yourwebsite.com"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-transform transform hover:scale-105 duration-300"
                        >
                            Publish Recipe
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </div>
    );    
}

export default CreatePage;
