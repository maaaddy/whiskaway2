import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPaperPlane, faBlender, faListOl, faSeedling, faBookMedical } from "@fortawesome/free-solid-svg-icons";

function RecipeDetailPage() {
    const [recipe, setRecipe] = useState(null);
    const [nutrition, setNutrition] = useState(null);
    const [cookbooks, setCookbooks] = useState([]);
    const [selectedCookbook, setSelectedCookbook] = useState('');
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [friends, setFriends] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [extendedNutrition, setExtendedNutrition] = useState(null);
    const [showMoreNutrition, setShowMoreNutrition] = useState(false);
    const [showFriendList, setShowFriendList] = useState(false);
    const { id } = useParams(); 
    const API_KEY = process.env.REACT_APP_API_KEY;

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const profileRes = await axios.get('/api/profile');
                const userId = profileRes.data.userInfo;
                const friendsRes = await axios.get(`/api/friends/${userId}`);
                setFriends(friendsRes.data);
            } catch (err) {
                console.error("Failed to fetch friends:", err);
            }
        };

        const fetchRecipe = async () => {
            try {
                const res = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`);
                setRecipe(res.data);
                if (res.data.nutrition) {
                    setNutrition(res.data.nutrition);
                }
            } catch (err) {
                console.error("Failed to fetch recipe:", err);
            }
        };

        const fetchCookbooks = async () => {
            try {
                const res = await axios.get('/api/cookbook');
                setCookbooks(res.data);
            } catch (err) {
                console.error('Failed to fetch cookbooks:', err);
            }
        };

        
        const fetchExtendedNutrition = async () => {
            try {
                const res = await axios.get(`https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=${API_KEY}`);
                setExtendedNutrition(res.data);
            } catch (err) {
                console.error("Error fetching extended nutrition data:", err);
            }
        };

        const fetchEquipment = async () => {
            try {
                const res = await axios.get(`https://api.spoonacular.com/recipes/${id}/equipmentWidget.json?apiKey=${API_KEY}`);
                setEquipment(res.data.equipment || []);
            } catch (err) {
                console.error("Error fetching equipment data:", err);
            }
        };

        fetchExtendedNutrition();
        fetchEquipment();
        fetchFriends();
        fetchRecipe();
        fetchCookbooks();

        window.addEventListener('openChat', () => {
            const link = sessionStorage.getItem('sendRecipeLink');
            if (link) {
                setTimeout(() => {
                    const chatInput = document.querySelector('input[placeholder="Type your message"]');
                    if (chatInput) {
                        chatInput.value = link;
                        chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, 500);
            }
        });
    }, [id, API_KEY]);

    const handleAddToCookbook = async () => {
        if (!selectedCookbook) {
            alert('Please select a cookbook!');
            return;
        }

        try {
            await axios.post(`/api/cookbook/${selectedCookbook}/addRecipe`, {
                recipeId: id,
            });
            localStorage.removeItem(`cookbook_${selectedCookbook}`);
            alert('Recipe added to cookbook successfully!');
        } catch (err) {
            console.error('Error adding recipe to cookbook:', err);
            alert('Failed to add recipe to cookbook');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (!recipe) return <p>Loading recipe...</p>;

    return (
        <div className="pt-16 max-w-4xl mx-auto px-4 py-8">
            <div className="w-full mb-6">
                <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full max-h-[500px] object-contain rounded-xl shadow"
                />
            </div>

            <div className="flex justify-between items-start flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex-1 border-r-2 border-gray-200">
                    <h1 className="text-4xl font-bold text-gray-900 mb-1 mr-1">{recipe.title}</h1>
                    <p className="text-sm text-gray-600">
                        Serves {recipe.servings} • Ready in {Math.floor(recipe.readyInMinutes / 60)}h {recipe.readyInMinutes % 60}m
                    </p>
                </div>
                <div className="relative flex gap-2 items-center sm:self-start">

                    <div className="relative">
                        <select
                            value={selectedCookbook}
                            onChange={(e) => setSelectedCookbook(e.target.value)}
                            className=" text-gray-800 mx-2 px-3 py-2 rounded-3xl bg-white hover:bg-gray-200"
                        >
                            <option value="" className='bg-white'>Select a Cookbook</option>
                            {cookbooks.map((cookbook) => (
                                <option key={cookbook._id} value={cookbook._id} className='bg-white'>
                                    {cookbook.title}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddToCookbook}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-3xl text-sm"
                        >
                            <FontAwesomeIcon icon={faPlus} size="lg" />
                        </button>
                    </div>

                    <div className="relative">
                        <button
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-3xl"
                            onClick={() => {
                                setShowShareOptions((prev) => !prev);
                                setShowFriendList(false);
                            }}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                        </button>

                        {showShareOptions && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                <button
                                    onClick={handleCopyLink}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    📋 Copy Link
                                </button>
                                <button
                                    onClick={() => {
                                        setShowFriendList(true);
                                        setShowShareOptions(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    💬 Friends
                                </button>
                            </div>
                        )}
                    </div>
                    {showFriendList && (
                        <div className="absolute top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                        <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                            Select a friend
                        </div>
                        {friends.length > 0 ? (
                            friends.map((friend) => (
                            <button
                                key={friend._id}
                                onClick={() => {
                                sessionStorage.setItem('sendRecipeLink', window.location.href);
                                window.dispatchEvent(new CustomEvent('openChat', {
                                    detail: { userId: friend._id }
                                }));
                                setShowFriendList(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                                💬 {friend.username}
                            </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No friends found</div>
                        )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4"><FontAwesomeIcon icon={faSeedling} size="md" className='text-teal-700' /> Ingredients</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-lg">
                    {recipe.extendedIngredients.map(ingredient => (
                        <li key={ingredient.id}>{ingredient.original}</li>
                    ))}
                </ul>
            </div>

            {equipment.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4"><FontAwesomeIcon icon={faBlender} size="md" className='text-teal-700' /> Supplies</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 text-lg">
                        {equipment.map((item, index) => (
                            <li key={index}>{item.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4"><FontAwesomeIcon icon={faListOl} size="md" className='text-teal-700' /> Directions</h2>
                <div className="space-y-4 text-gray-800 text-lg leading-relaxed">
                    {recipe.analyzedInstructions?.length > 0 ? (
                        recipe.analyzedInstructions[0].steps.map((step) => (
                            <div key={step.number} className="flex items-start gap-3">
                                <span className="font-bold text-teal-600">{step.number}.</span>
                                <p>{step.step}</p>
                            </div>
                        ))
                    ) : (
                        <p>No instructions available.</p>
                    )}
                </div>
            </div>

            {extendedNutrition?.nutrients && (
                <div className="bg-white p-6 rounded-xl shadow mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4"><FontAwesomeIcon icon={faBookMedical} size="md" className='text-teal-700' /> Nutrition</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-800 text-base">
                        {(showMoreNutrition ? extendedNutrition.nutrients : extendedNutrition.nutrients.slice(0, 6)).map((nutrient, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-md text-center shadow">
                                {nutrient.name}: {nutrient.amount}{nutrient.unit}
                                <br />
                                <span className="text-sm text-gray-500">Daily: {nutrient.percentOfDailyNeeds}%</span>
                            </div>
                        ))}
                    </div>
                    {extendedNutrition.nutrients.length > 6 && (
                        <div className="text-center mt-4">
                            <button
                                onClick={() => setShowMoreNutrition(!showMoreNutrition)}
                                className="text-blue-600 hover:underline"
                            >
                                {showMoreNutrition ? "Show Less" : "Show More"}
                            </button>
                        </div>
                    )}
                </div>
            )}


        </div>
    );
}

export default RecipeDetailPage;