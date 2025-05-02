import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { FaLock, FaLockOpen, FaPlus, FaTrash } from 'react-icons/fa';
import Modal from '../Modal';
import RecipeDetailPage from '../RecipeDetailPage/RecipeDetailPage';

const mealTypeOptions = [
  { value: 'main course', label: 'Main Course' },
  { value: 'side dish', label: 'Side Dish' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'salad', label: 'Salad' },
  { value: 'bread', label: 'Bread' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'soup', label: 'Soup' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'sauce', label: 'Sauce' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'marinade', label: 'Marinade' },
  { value: 'fingerfood', label: 'Finger Food' },
  { value: 'snack', label: 'Snack' },
  { value: 'drink', label: 'Drink' }
];

const cuisineOptions = [
  { value: 'african', label: 'African' },
  { value: 'asian', label: 'Asian' },
  { value: 'american', label: 'American' },
  { value: 'british', label: 'British' },
  { value: 'cajun', label: 'Cajun' },
  { value: 'caribbean', label: 'Caribbean' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'eastern european', label: 'Eastern European' },
  { value: 'european', label: 'European' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'greek', label: 'Greek' },
  { value: 'indian', label: 'Indian' },
  { value: 'irish', label: 'Irish' },
  { value: 'italian', label: 'Italian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'korean', label: 'Korean' },
  { value: 'latin american', label: 'Latin American' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'middle eastern', label: 'Middle Eastern' },
  { value: 'nordic', label: 'Nordic' },
  { value: 'southern', label: 'Southern' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'thai', label: 'Thai' },
  { value: 'vietnamese', label: 'Vietnamese' }
];

const dietOptions = [
  { value: 'gluten free', label: 'Gluten-Free' },
  { value: 'ketogenic', label: 'Ketogenic' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'lacto vegetarian', label: 'Lacto-Vegetarian' },
  { value: 'ovo vegetarian', label: 'Ovo-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarian', label: 'Pescetarian' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'primal', label: 'Primal' },
  { value: 'low fodmap', label: 'Low FODMAP' },
  { value: 'whole30', label: 'Whole30' }
];

const intoleranceOptions = [
  { value: 'dairy', label: 'Dairy-Free' },
  { value: 'egg', label: 'Egg-Free' },
  { value: 'gluten', label: 'Gluten-Free' },
  { value: 'grain', label: 'Grain-Free' },
  { value: 'peanut', label: 'Peanut-Free' },
  { value: 'seafood', label: 'Seafood-Free' },
  { value: 'sesame', label: 'Sesame-Free' },
  { value: 'shellfish', label: 'Shellfish-Free' },
  { value: 'soy', label: 'Soy-Free' },
  { value: 'sulfite', label: 'Sulfite-Free' },
  { value: 'tree nut', label: 'Tree Nut-Free' },
  { value: 'wheat', label: 'Wheat-Free' }
];

function CreatePage() {
    const [recipes, setRecipes] = useState([]);
    const [title, setTitle] = useState('');
    const [prepTime, setPrepTime] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [instructions, setInstructions] = useState(['']);
    const [tags, setTags] = useState({ mealType: [], cuisine: [], diet: [], intolerance: [] });
    const [cookbookId, setCookbookId] = useState('');
    const [cookbooks, setCookbooks] = useState([]);
    const [isPublic, setIsPublic] = useState(true);
    const [link, setLink] = useState('');
    const [image, setImage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleIngredientChange = (index, value) => {
      const newIngredients = [...ingredients];
      newIngredients[index] = value;
      setIngredients(newIngredients);
    };
  
    const addIngredient = () => setIngredients([...ingredients, '']);
  
    const handleInstructionChange = (index, value) => {
      const newInstructions = [...instructions];
      newInstructions[index] = value;
      setInstructions(newInstructions);
    };
  
    const addInstruction = () => setInstructions([...instructions, '']);
  
    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      if (file) reader.readAsDataURL(file);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const recipeData = {
          title,
          image,
          instructions,
          ingredients,
          prepTime,
          cookTime,
          servings,
          link,
          tags,
          isPublic,
          cookbookId
        };
        await axios.post('/api/recipes', recipeData);
        await fetchUserRecipes();
        setShowModal(false);
        
        setTitle('');
        setPrepTime('');
        setCookTime('');
        setServings('');
        setIngredients(['']);
        setInstructions(['']);
        setTags({ mealType: [], cuisine: [], diet: [], intolerance: [] });
        setCookbookId('');
        setIsPublic(true);
        setImage(null);
        setShowModal(false);
        setTimeout(() => alert('Recipe created!'), 100);
      } catch (err) {
        console.error('Error creating recipe:', err);
      } finally {
        setIsSubmitting(false);
      }
    };    
  
    const fetchUserRecipes = async () => {
      try {
        const res = await axios.get('/api/my-recipes');
        setRecipes(res.data);
      } catch (err) {
        console.error('Failed to fetch user recipes:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const handleDeleteRecipe = async (id) => {
      const confirmed = window.confirm(
        'Are you sure you want to delete this recipe? This action cannot be undone.'
      );
      if (!confirmed) return;

      try {
        await axios.delete(`/api/recipes/${id}`);
        setRecipes(prev => prev.filter(recipe => recipe._id !== id));
      } catch (err) {
        console.error("Error deleting recipe:", err);
      }
    };
    
    const toggleRecipePrivacy = async (id, currentStatus) => {
      try {
        const updated = await axios.put(`/api/recipes/${id}`, { isPublic: !currentStatus });
        setRecipes(prev =>
          prev.map(recipe =>
            recipe._id === id ? { ...recipe, isPublic: updated.data.isPublic } : recipe
          )
        );
      } catch (err) {
        console.error("Error updating recipe privacy:", err);
      }
    };    

    useEffect(() => {
      fetchUserRecipes();
    }, []);

    useEffect(() => {
      async function fetchCookbooks() {
        try {
          const res = await axios.get('/api/cookbook');
          setCookbooks(res.data);
        } catch (err) {
          console.error('Failed to fetch cookbooks:', err);
        }
      }
      fetchCookbooks();
    }, []);
    
  
    return (
      <div className="p-6 max-w-5xl mx-auto py-16 relative">
        <div className="text-center font-serif font-semibold text-2xl text-teal-700 py-2 pb-4">
          <p>Recipes</p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="animate-pulse space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {recipes.map(recipe => (
              <div
                key={recipe._id}
                className="relative rounded-lg overflow-hidden shadow hover:shadow-lg transition group h-64 w-52"
              >
                <div
                  key={recipe._id}
                  className="relative w-full h-64 cursor-pointer"
                  onClick={() => {
                    setSelectedId(recipe._id);
                    setShowModal(true);
                  }}
                >
                  <img
                    src={recipe.image ? `data:image/jpeg;base64,${recipe.image}` : '/placeholder.jpg'}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded-md -translate-y-1/4 text-center">
                      {recipe.title}
                    </div>
                  </div>
                </div>
    
                <button
                  onClick={() => handleDeleteRecipe(recipe._id)}
                  className="absolute top-2 right-2 bg-white/80 text-gray-500 hover:text-red-600 p-1.5 rounded-full z-10 transition"
                >
                  <FaTrash size={16} />
                </button>
                <button
                  onClick={() => toggleRecipePrivacy(recipe._id, recipe.isPublic)}
                  className="absolute bottom-2 right-2 bg-white/80 text-gray-700 hover:text-gray-900 p-1.5 rounded-full z-10"
                >
                  {recipe.isPublic ? <FaLockOpen size={18} /> : <FaLock size={18} />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-center text-gray-700">
              No recipes created yet. Click{' '}
              <button onClick={() => setShowModal(true)} className="text-teal-600 underline">
                + Add Recipe
              </button>{' '}
              to create one.
            </p>
          </div>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="
          fixed bottom-6 right-6 bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-lg focus:outline-none mb-16">
          <FaPlus/>
        </button>
    
        {showModal && selectedId && (
          <Modal onClose={() => {
            setShowModal(false);
            setSelectedId(null);
          }}>
            <RecipeDetailPage recipeId={selectedId} />
          </Modal>
        )}
        
        {showModal && !selectedId && (
          <Modal onClose={() => setShowModal(false)}>
            <div className="max-w-4xl mx-auto p-6 font-serif">
              <h2 className="text-2xl font-bold text-center font-serif text-teal-800 mb-6">Create a New Recipe</h2>
              <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
                Title*
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full border p-2 rounded"
                  required
                />
    
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={prepTime}
                    onChange={e => setPrepTime(e.target.value)}
                    placeholder="Prep Time (min)"
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="number"
                    value={cookTime}
                    onChange={e => setCookTime(e.target.value)}
                    placeholder="Cook Time (min)"
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="text"
                    value={servings}
                    onChange={e => setServings(e.target.value)}
                    placeholder="Servings"
                    className="w-full border p-2 rounded"
                  />
                </div>
    
                <div>
                  <label className="block mb-1">Ingredients*</label>
                  {ingredients.map((item, idx) => (
                    <input
                      key={idx}
                      value={item}
                      onChange={e => handleIngredientChange(idx, e.target.value)}
                      className="w-full mb-2 border p-2 rounded text-gray-700"
                    />
                  ))}
                  <button type="button" onClick={addIngredient} className="text-teal-600 text-sm">
                    + Add Ingredient
                  </button>
                </div>
    
                <div>
                  <label className="block mb-1 text-gray-700">Instructions</label>
                  {instructions.map((step, idx) => (
                    <textarea
                      key={idx}
                      value={step}
                      onChange={e => handleInstructionChange(idx, e.target.value)}
                      className="w-full mb-2 border p-2 rounded"
                      rows="2"
                    />
                  ))}
                  <button type="button" onClick={addInstruction} className="text-teal-600 text-sm">
                    + Add Step
                  </button>
                </div>
    
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-gray-700">Meal Type</label>
                    <Select
                      isMulti
                      options={mealTypeOptions}
                      value={tags.mealType}
                      onChange={selected => setTags(prev => ({ ...prev, mealType: selected }))}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700">Cuisine</label>
                    <Select
                      isMulti
                      options={cuisineOptions}
                      value={tags.cuisine}
                      onChange={selected => setTags(prev => ({ ...prev, cuisine: selected }))}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700">Diet</label>
                    <Select
                      isMulti
                      options={dietOptions}
                      value={tags.diet}
                      onChange={selected => setTags(prev => ({ ...prev, diet: selected }))}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700">Intolerances</label>
                    <Select
                      isMulti
                      options={intoleranceOptions}
                      value={tags.intolerance}
                      onChange={selected => setTags(prev => ({ ...prev, intolerance: selected }))}
                    />
                  </div>
                </div>
    
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Add to Cookbook</label>
                  <select
                    value={cookbookId}
                    onChange={e => setCookbookId(e.target.value)}
                    className="w-full border p-2 rounded text-gray-700"
                  >
                    <option value="">Select a Cookbook</option>
                    {cookbooks.map(cb => (
                      <option key={cb._id} value={cb._id}>{cb.title}</option>
                    ))}
                  </select>
                </div>
    
                <div className="flex items-center justify-between font-serif">
                  <label className="text-gray-700 font-medium">Privacy</label>
                    <button
                      type="button"
                      onClick={() => setIsPublic(!isPublic)}
                      className="flex items-center text-gray-700 hover:text-gray-900 transition"
                    >
                      {isPublic ? <FaLockOpen size={22} className="mr-2" /> : <FaLock size={22} className="mr-2" />}
                      {isPublic ? 'Public' : 'Private'}
                    </button>
                </div>
                <p className='mb-6 font-serif font-thin text-sm text-gray-600'>Public recipes appear on your profile.</p>
                <p>Recipe Photo*</p>
                <label htmlFor="recipe-image-upload" className="mb-4 block cursor-pointer">
                  {image ? (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-52 h-64 object-cover rounded-lg border border-gray-300"
                    />
                  ) : (
                    <div className="w-52 h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                      Click to select a photo
                    </div>
                  )}
                </label>
                <input
                  id="recipe-image-upload"
                  type="file"
                  onChange={handleImageUpload}
                  className="hidden"
                />
            
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full py-3 rounded-lg font-medium transition
                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 text-white'}
                  `}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"
                        />
                      </svg>
                      Publishing…
                    </span>
                  ) : (
                    'Publish Recipe'
                  )}
                </button>
              </form>
            </div>
          </Modal>
        )}
      </div>
    );
  }
  
export default CreatePage;