import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPaperPlane, faBlender, faListOl, faSeedling, faBookMedical, faComment, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { faHeart as heartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as heartOutline } from "@fortawesome/free-regular-svg-icons";
import Modal from '../Modal';
import { FaExclamationTriangle } from 'react-icons/fa';

function RecipeDetailPage({ recipeId }) {
    const [recipe, setRecipe] = useState(null);
    const [nutrition, setNutrition] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [visibleComments, setVisibleComments] = useState(3);
    const [cookbooks, setCookbooks] = useState([]);
    const [selectedCookbook, setSelectedCookbook] = useState('');
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [friends, setFriends] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [extendedNutrition, setExtendedNutrition] = useState(null);
    const [showMoreNutrition, setShowMoreNutrition] = useState(false);
    const [showFriendList, setShowFriendList] = useState(false);
    const { id: routeId } = useParams();
    const [showModal, setShowModal]             = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [intolerances, setIntolerances]     = useState([]);
    const [intolerancesLoading, setIntolerancesLoading] = useState(true);
    const [allergenMatches, setAllergenMatches] = useState([]);
    
    const id = recipeId || routeId;
    const API_KEY = process.env.REACT_APP_API_KEY;
    const MAX_COMMENT_LENGTH = 150;

    const fetchComments = async () => {
        try {
          const res = await axios.get(`/api/recipes/${id}/comments`);
          setComments(res.data);
          setVisibleComments(3);
          setCommentsLoaded(true);
        } catch (err) {
          console.error("Failed to fetch comments:", err);
        }
    };      

    const capitalize = str =>
        str
          .split(' ')
          .map(s => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');
    
    useEffect(() => {
        if (!id) return;

        const fetchUserIntolerances = async () => {
            setIntolerancesLoading(true);
            try {
            const profileRes = await axios.get('/api/profile');
            setIntolerances(profileRes.data.intolerances || []);
            } catch (err) {
            console.error("Failed to fetch user intolerances:", err);
            } finally {
            setIntolerancesLoading(false);
            }
        };

        fetchUserIntolerances();

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
                const isUserRecipe = id.length === 24;
            if (isUserRecipe) {
                const res = await axios.get(`/api/recipes/${id}`);
                setRecipe(res.data);
            } else {
                const res = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`);
                setRecipe(res.data);
                if (res.data.nutrition) {
                    setNutrition(res.data.nutrition);
                }
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

        const fetchCommentCount = async () => {
            try {
              const res = await axios.get(`/api/recipes/${id}/comments/count`);
              setCommentCount(res.data.count);
            } catch (err) {
              console.error("Failed to fetch comment count:", err);
            }
        };
          
        fetchCommentCount();       
        
        const fetchLikes = async () => {
            try {
            const res = await axios.get(`/api/recipes/${id}/likes`);
            setLikeCount(res.data.likeCount);
            setIsLiked(res.data.liked);
            } catch (err) {
            console.error("Failed to fetch likes:", err);
            }
        };
        fetchLikes();
  
        const fetchEquipment = async () => {
            try {
                const res = await axios.get(`https://api.spoonacular.com/recipes/${id}/equipmentWidget.json?apiKey=${API_KEY}`);
                setEquipment(res.data.equipment || []);
            } catch (err) {
                console.error("Error fetching equipment data:", err);
            }
        };

        fetchFriends();
        fetchRecipe();
        fetchCookbooks();

        if (id.length !== 24) {
            fetchExtendedNutrition();
            fetchEquipment();
        }        

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
          const resp = err.response;
          if (resp?.status === 409 || resp?.data?.error?.toLowerCase().includes('already')) {
            alert('This recipe is already in the cookbook.');
          } else {
            alert('Failed to add recipe to cookbook.');
          }
        }
      };      

      const handleCopyLink = () => {
        const shareUrl = `${window.location.origin}/recipe/${id}`;
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      };

    const handleCommentSubmit = async () => {
        if (!newComment.trim() || newComment.length < 3) {
            alert('Comment is too short!');
            return;
        }          
      
        try {
          await axios.post(`/api/recipes/${id}/comments`, { text: newComment });
          setNewComment('');
          setCommentCount(prev => prev + 1);
          fetchComments();
        } catch (err) {
          console.error("Failed to post comment:", err);
        }
    };

    const handleLike = async () => {
        try {
          const res = await axios.post(`/api/recipes/${id}/like`);
          setLikeCount(res.data.likeCount);
          setIsLiked(res.data.liked);
        } catch (err) {
          console.error("Failed to toggle like:", err);
        }
      };

      useEffect(() => {
        if (!recipe || !Array.isArray(intolerances)) return;
        if (intolerances.length === 0) {
          setAllergenMatches([]);
          return;
        }
      
        const ingredientTexts = [];
        if (Array.isArray(recipe.extendedIngredients)) {
          recipe.extendedIngredients.forEach(i => {
            const text = (i?.original || i?.name || '').toString();
            ingredientTexts.push(text.toLowerCase());
          });
        } else if (Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach(item => {
            const text = typeof item === 'string'
              ? item
              : (item?.name || '').toString();
            ingredientTexts.push(text.toLowerCase());
          });
        }
      
        const matches = intolerances.reduce((acc, intol) => {
          if (typeof intol !== 'string') return acc;
          const key = intol.toLowerCase();
          const wordRegex = new RegExp(`\\b${key}\\b`);
      
          if (key === 'dairy' && recipe.dairyFree === false) {
            acc.push(capitalize(key));
          } else if (key === 'gluten' && recipe.glutenFree === false) {
            acc.push(capitalize(key));
          }
          else if (ingredientTexts.some(text => wordRegex.test(text))) {
            acc.push(capitalize(key));
          }
          return acc;
        }, []);
      
        setAllergenMatches([...new Set(matches)]);
      }, [recipe, intolerances]);
      
      
    if (!recipe) {
        return (
            <div className="pt-16 max-w-4xl mx-auto px-4 pb-20">
                <div className="animate-pulse space-y-6">
                    <div className="h-96 bg-gray-200 rounded-xl" />

                    <div className="h-8 bg-gray-200 rounded w-1/3" />

                    <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                </div>
            </div>
        );
        }

    return (
        <div className="pt-8 max-w-4xl mx-auto px-4 pb-20 font-serif">
            <div className="w-full mb-6 relative">
                <img
                    src={
                        recipe.extendedIngredients
                        ? recipe.image
                        : recipe.image
                            ? `data:image/jpeg;base64,${recipe.image}`
                            : '/placeholder.jpg'
                    }
                    alt={recipe.title}
                    className="w-full max-h-[500px] object-contain rounded-xl shadow bg-white"
                />

                {intolerancesLoading && (
                    <div className="absolute top-2 left-2 bg-yellow-600 bg-opacity-75 text-white text-sm px-3 mt-4 py-3 rounded">
                    Loading intolerances…
                    </div>
                )}

                {allergenMatches.length > 0 && (
                <div className="absolute top-2 left-2 flex items-center bg-red-600 bg-opacity-75 text-white text-sm px-3 mt-4 py-3 rounded max-w-[90%] break-words">
                <FaExclamationTriangle className="mr-1 inline-block" />
                <span>
                  <strong>Contains:</strong> {allergenMatches.join(', ')}.
                </span>
              </div>
              
                )}

            </div>

            <div className="flex justify-between items-start flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex-1 md:border-r-2 border-gray-200">
                    <h1 className="text-4xl font-bold text-gray-900 mb-1 mr-1">{recipe.title}</h1>
                    <p className="text-sm text-gray-600">
                        {recipe.servings && <>Serves {recipe.servings} • </>}

                        {recipe.readyInMinutes !== undefined ? (
                            (() => {
                            const hours = Math.floor(recipe.readyInMinutes / 60);
                            const minutes = recipe.readyInMinutes % 60;
                            return <>Ready in {hours > 0 && `${hours}h `}{minutes}m</>;
                            })()
                        ) : recipe.prepTime || recipe.cookTime ? (
                            (() => {
                            const totalTime = recipe.prepTime + recipe.cookTime;
                            const hours = Math.floor(totalTime / 60);
                            const minutes = totalTime % 60;
                            return <>Ready in {hours > 0 && `${hours}h `}{minutes}m</>;
                            })()
                        ) : (
                            <>No time info available</>
                        )}

                        {recipe.owner?.username && (
                            <> • Author:{' '}
                            <Link
                                to={`/profile/${recipe.owner.username}`}
                                className="text-teal-500 hover:underline"
                            >
                                {recipe.owner.username}
                            </Link>
                            </>
                        )}
                    </p>
                </div>
                <div
                className="
                    relative
                    flex flex-wrap gap-2
                    sm:flex-nowrap sm:items-center
                "
                >
                <div className="order-1 sm:order-2 sm:w-auto flex gap-2">
                    <select
                    value={selectedCookbook}
                    onChange={e => setSelectedCookbook(e.target.value)}
                    className="
                        flex-1 sm:px-1 px-3 py-2 rounded-3xl bg-white hover:bg-gray-200 text-gray-800 text-xs md:text-base
                    "
                    >
                    <option value="">Add to Cookbook</option>
                    {cookbooks.map(cb => (
                        <option key={cb._id} value={cb._id}>{cb.title}</option>
                    ))}
                    </select>
                    <button
                    onClick={handleAddToCookbook}
                    className="
                        bg-teal-600 hover:bg-teal-700 text-white
                         px-3 md:px-3 py-0 md:py-2 rounded-full text-sm
                    "
                    >
                    <FontAwesomeIcon icon={faPlus} className="text-md md:text-xl" />
                    </button>

                    <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-full"
                    onClick={() => {
                        setShowShareOptions(prev => !prev);
                        setShowFriendList(false);
                    }}
                    >
                    <FontAwesomeIcon icon={faPaperPlane} className="text-md md:text-xl" />
                    </button>
                </div>

                <button
                    onClick={handleLike}
                    className="
                    order-2 w-4 md:w-auto
                    flex items-center gap-1 text-lg
                    hover:opacity-75 transition
                    sm:order-1
                    "
                >
                    <FontAwesomeIcon
                    icon={isLiked ? heartSolid : heartOutline}
                    className={isLiked ? "text-red-500" : "text-gray-500"}
                    />
                    <span>{likeCount}</span>
                </button>

                <div
                    className="
                    order-2 w-auto
                    relative
                    sm:order-3
                    "
                >
                    {showShareOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
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

                    {showFriendList && (
                    <div className="absolute top-full mt-2 w-56 bg-white border rounded-md shadow-lg z-20">
                        <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                        Select a friend
                        </div>
                        {friends.length > 0 ? (
                        friends.map(friend => (
                            <button
                            key={friend._id}
                            onClick={() => {
                                const shareUrl = `${window.location.origin}/recipe/${id}`;
                                sessionStorage.setItem('sendRecipeLink', shareUrl);
                                window.dispatchEvent(
                                new CustomEvent('openChat', { detail: { userId: friend._id } })
                                );
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
        </div>  

            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4"><FontAwesomeIcon icon={faSeedling} size="md" className='text-teal-700' /> Ingredients</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-lg">
                {recipe.extendedIngredients
                    ? recipe.extendedIngredients.map(ingredient => (
                        <li key={ingredient.id}>{ingredient.original}</li>
                        ))
                    : recipe.ingredients?.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
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
                ) : recipe.instructions?.length > 0 ? (
                recipe.instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                    <span className="font-bold text-teal-600">{idx + 1}.</span>
                    <p>{step}</p>
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
                                className="text-teal-600 hover:underline"
                            >
                                {showMoreNutrition ? "Show Less" : "Show More"}
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className="bg-white shadow rounded-xl mt-6 overflow-hidden">
            <div
                className="p-6 border-b cursor-pointer hover:bg-gray-50 transition"
                onClick={() => {
                setShowComments((prev) => !prev);
                if (!commentsLoaded) fetchComments();
                }}
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
                <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faComment} size="md" className="text-teal-700" />
                    Comments ({commentCount})
                </span>
                <span className="text-sm text-blue-600 underline">
                    {showComments ? <FontAwesomeIcon icon={faAngleUp} size="lg" className="text-teal-700" /> : <FontAwesomeIcon icon={faAngleDown} size="lg" className="text-teal-700" />}
                </span>
                </h2>
            </div>
            {showComments && (
                <div className="p-6">
                    <div className="mb-4">
                        <textarea
                            value={newComment}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                                setNewComment(e.target.value);
                                }
                            }}
                            placeholder="Write a comment..."
                            className="w-full border rounded-lg p-2 resize-none"
                            rows={3}
                        />
                        <p className="text-sm text-gray-500 mt-1 text-right">
                            {newComment.length}/{MAX_COMMENT_LENGTH} characters
                        </p>
                        <button
                            onClick={handleCommentSubmit}
                            className="mt-2 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                        >
                            Post Comment
                        </button>
                    </div>

                    <div className="space-y-4">
                        {comments.length === 0 && <p className="text-gray-500">No comments yet.</p>}
                        {comments.slice(0, visibleComments).map((comment) => (
                        <div key={comment._id} className="border-t pt-2">
                            <p className="text-sm text-gray-800 font-semibold flex items-center gap-1">
                            {comment.username}
                            {comment.username === recipe.owner?.username && (
                                <span className="ml-1 bg-teal-200 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded">
                                Author
                                </span>
                            )}
                            </p>
                            <p className="text-gray-700">{comment.text}</p>
                            <p className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                            })}
                            </p>
                        </div>
                        ))}
                    </div>
                    {visibleComments < comments.length && (
                    <div className="mt-4 text-center">
                        <button
                        onClick={() => setVisibleComments((prev) => prev + 3)}
                        className="text-sm text-blue-600 underline hover:text-blue-800 transition"
                        >
                        Load more comments
                        </button>
                    </div>
                    )}
                </div>
            )}
            </div>
        </div>
    );
}

export default RecipeDetailPage;