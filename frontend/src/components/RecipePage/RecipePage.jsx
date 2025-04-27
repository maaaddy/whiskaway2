import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { FaLock, FaLockOpen } from 'react-icons/fa';

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
    const [view, setView] = useState('myRecipes');
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
        alert('Recipe created!');
        setView('myRecipes');
      } catch (err) {
        console.error('Error submitting recipe:', err);
      }
    };
  
    const fetchUserRecipes = async () => {
      try {
        const res = await axios.get('/api/my-recipes');
        setRecipes(res.data);
      } catch (err) {
        console.error('Failed to fetch user recipes:', err);
      }
    };
  
    useEffect(() => {
      if (view === 'myRecipes') {
        fetchUserRecipes();
      }
    }, [view]);

    const handleDeleteRecipe = async (id) => {
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
  
    return (
      <div className="p-6 max-w-5xl mx-auto py-16">
        <div className="flex justify-center space-x-8 mb-6">
          <button
            className={`text-lg font-medium pb-2 ${view === 'myRecipes' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600'} transition`}
            onClick={() => setView('myRecipes')}
          >
            My Recipes
          </button>
          <button
            className={`text-lg font-medium pb-2 ${view === 'create' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600'} transition`}
            onClick={() => setView('create')}
          >
            Create
          </button>
        </div>
  
        {view === 'myRecipes' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.length > 0 ? (
              recipes.map(recipe => (
                <div
                  key={recipe._id}
                  className="relative rounded-lg overflow-hidden shadow hover:shadow-lg transition group"
                >
                  <Link to={`/recipe/${recipe._id}`} className="block w-full h-64">
                    <img
                      src={recipe.image ? `data:image/jpeg;base64,${recipe.image}` : ""}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded-md translate-y-[-20%] text-center">
                        {recipe.title}
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleDeleteRecipe(recipe._id)}
                    className="absolute top-2 right-2 bg-white/80 text-gray-500 hover:text-red-600 p-1.5 rounded-full z-5 transition"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 36 36">
                      <path d="M6,9V31a2.93,2.93,0,0,0,2.86,3H27.09A2.93,2.93,0,0,0,30,31V9Zm9,20H13V14h2Zm8,0H21V14h2Z"></path>
                      <path d="M30.73,5H23V4A2,2,0,0,0,21,2h-6.2A2,2,0,0,0,13,4V5H5A1,1,0,1,0,5,7H30.73a1,1,0,0,0,0-2Z"></path>
                    </svg>
                  </button>

                  <button
                    onClick={() => toggleRecipePrivacy(recipe._id, recipe.isPublic)}
                    className="absolute bottom-2 right-2 bg-white/80 text-gray-700 hover:text-gray-900 p-1.5 rounded-full z-5"
                  >
                    {recipe.isPublic ? <FaLockOpen size={18} /> : <FaLock size={18} />}
                  </button>
                </div>
              ))
            ) : (
                    <p className="text-center text-gray-700 py-4 col-span-full">
                      No cookbooks created yet. Click{' '}
                      <button
                        onClick={() => setView('create')}
                        className="text-teal-600 underline"
                      >
                        Create
                      </button>{' '}
                      to add one.
                    </p>
            )}
          </div>
        ) : (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">New Recipe</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border p-2 rounded" required />
            <div className="flex gap-4">
                <input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="Prep Time (min)" className="w-full border p-2 rounded" />
                <input type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="Cook Time (min)" className="w-full border p-2 rounded" />
                <input type="text" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="Servings" className="w-full border p-2 rounded" />
            </div>
        
            <div>
                <label className="font-semibold">Ingredients</label>
                {ingredients.map((item, idx) => (
                <input key={idx} value={item} onChange={(e) => handleIngredientChange(idx, e.target.value)} className="w-full mb-2 border p-2 rounded" />
                ))}
                <button type="button" onClick={addIngredient} className="text-blue-600 text-sm">+ Add Ingredient</button>
            </div>
        
            <div>
                <label className="font-semibold">Instructions</label>
                {instructions.map((step, idx) => (
                <textarea key={idx} value={step} onChange={(e) => handleInstructionChange(idx, e.target.value)} className="w-full mb-2 border p-2 rounded" rows="2" />
                ))}
                <button type="button" onClick={addInstruction} className="text-blue-600 text-sm">+ Add Step</button>
            </div>
        
            <div className="space-y-4">
                <div>
                <label className="font-semibold block mb-2">Meal Type</label>
                <Select isMulti options={mealTypeOptions} value={tags.mealType} onChange={(selected) => setTags(prev => ({ ...prev, mealType: selected }))} />
                </div>
                <div>
                <label className="font-semibold block mb-2">Cuisine</label>
                <Select isMulti options={cuisineOptions} value={tags.cuisine} onChange={(selected) => setTags(prev => ({ ...prev, cuisine: selected }))} />
                </div>
                <div>
                <label className="font-semibold block mb-2">Diet</label>
                <Select isMulti options={dietOptions} value={tags.diet} onChange={(selected) => setTags(prev => ({ ...prev, diet: selected }))} />
                </div>
                <div>
                <label className="font-semibold block mb-2">Intolerances</label>
                <Select isMulti options={intoleranceOptions} value={tags.intolerance} onChange={(selected) => setTags(prev => ({ ...prev, intolerance: selected }))} />
                </div>
            </div>
        
            <div>
                <label className="block font-medium mb-1">Add to Cookbook</label>
                <select value={cookbookId} onChange={(e) => setCookbookId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Select a Cookbook</option>
                {cookbooks.map(cb => (
                    <option key={cb._id} value={cb._id}>{cb.title}</option>
                ))}
                </select>
            </div>
        
            <div>
                <label className="block font-medium mb-1">Visibility</label>
                <label className="inline-flex items-center">
                <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} className="mr-2" />
                {isPublic ? 'Public' : 'Private'}
                </label>
            </div>
        
            <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Optional Link" className="w-full border p-2 rounded" />
            <input type="file" onChange={handleImageUpload} className="w-full" />
        
            <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl">
                Publish Recipe
            </button>
            </form>
        </div>
        )}
      </div>
    );
  }
  
export default CreatePage;