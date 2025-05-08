import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import { useParams, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import InviteModal from '../InviteModal/InviteModal';
import { FaTrash } from 'react-icons/fa';
import Modal from '../Modal';
import RecipeDetailPage from '../RecipeDetailPage/RecipeDetailPage';
import { jsPDF } from 'jspdf';

const axiosInstance = axiosRateLimit(axios.create(), { maxRequests: 5, perMilliseconds: 1000 });

function CookbookDetailPage() {
  const { id } = useParams();
  const [cookbook, setCookbook] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [inviteMode, setInviteMode] = useState(false);
  const [ownerUsernames, setOwnerUsernames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  const API_KEY = process.env.REACT_APP_API_KEY;
  const fetchCookbook = async () => {
    const profileRes = await axios.get('/api/profile');
    setCurrentUsername(profileRes.data.username);

    const cached = localStorage.getItem(`cookbook_${id}`);
    if (cached) {
      const { timestamp, cookbook, recipes } = JSON.parse(cached);
      const isFresh = Date.now() - timestamp < 1000 * 60 * 10;
      if (isFresh) {
        setIsOwner(
          cookbook.owners
            .map(o => o.toString())
            .includes(profileRes.data.userId)
        );
        setCookbook(cookbook);
        setRecipes(recipes);
        const ownerProfiles = await Promise.all(
          cookbook.owners.map(ownerId => axios.get(`/api/users/${ownerId}`))
        );
        setOwnerUsernames(ownerProfiles.map(r => r.data.username));
        setLoading(false);
        return;
      }
    }

    try {
      const response = await axios.get(`/api/cookbook/${id}`);
      setCookbook(response.data);
      setIsOwner(
        response.data.owners
          .map(o => o.toString())
          .includes(profileRes.data.userId)
      );
      const ownerIds = response.data.owners;
      const ownerProfiles = await Promise.all(
        ownerIds.map(ownerId => axios.get(`/api/users/${ownerId}`))
      );
      setOwnerUsernames(ownerProfiles.map(r => r.data.username));
      setCurrentUsername(profileRes.data.username);

      const allRecipes = await Promise.all(
        response.data.recipes.map(async recipeId => {
          const isUserRecipe = /^[a-f\d]{24}$/i.test(recipeId);
          if (isUserRecipe) {
            try {
              const res = await axios.get(`/api/recipes/${recipeId}`);
              return { ...res.data, id: recipeId, isUser: true };
            } catch {
              return null;
            }
          } else {
            try {
              const res = await axiosInstance.get(
                `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
              );
              return res.data;
            } catch {
              return null;
            }
          }
        })
      );
      const cleanRecipes = allRecipes.filter(Boolean);
      setRecipes(cleanRecipes);

      localStorage.setItem(
        `cookbook_${id}`,
        JSON.stringify({
          timestamp: Date.now(),
          cookbook: response.data,
          recipes: cleanRecipes,
        })
      );
    } catch (err) {
      console.error('Error fetching cookbook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCookbook();
  }, [id, API_KEY]);  

  const handleRemoveRecipe = async (idToRemove) => {
    const confirmed = window.confirm('Are you sure you want to remove this recipe?');
    if (!confirmed) return;

    try {
      await axios.delete(`/api/cookbook/${id}/removeRecipe/${idToRemove}`);
      localStorage.removeItem(`cookbook_${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== idToRemove));
      toast.success('Recipe removed');
    } catch (err) {
      toast.error('Failed to remove recipe');
    }
  };      

  const downloadPdf = async () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.setFont('times', 'normal');
    const margin = 40;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const logoWidth = 40;
    const logoHeight = 40;
    const headerHeight = logoHeight + 10;
    const extraHeaderSpacing = 20;
    const lineSpacing = 16;
    const logoUrl = '/whiskaway.png';
    const labelText = 'WhiskAway';
    const urlText = 'https://whiskaway.food';
    const fontSizeHeader = 14;
  
    const loadImage = url =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    const img = await loadImage(logoUrl);
  
    const drawHeader = () => {
      doc.setFontSize(fontSizeHeader);
      const logoX = margin;
      const logoY = margin - 5;
      doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
  
      const centerY = logoY + logoHeight / 2;
      const textY = centerY + fontSizeHeader / 2 - 2;
  
      const labelX = logoX + logoWidth + 10;
      doc.text(labelText, labelX, textY, { align: 'left' });
  
      const urlWidth = doc.getTextWidth(urlText);
      const urlX = pageWidth - margin - urlWidth;
      doc.text(urlText, urlX, textY, { align: 'left' });
    };
  
    let y = margin + headerHeight + extraHeaderSpacing;
    drawHeader();
  
    recipes.forEach((recipe, idx) => {
      if (idx > 0) {
        doc.addPage();
        drawHeader();
        y = margin + headerHeight + extraHeaderSpacing;
      }
  
      if (y + 24 > pageHeight - margin) {
        doc.addPage();
        drawHeader();
        y = margin + headerHeight + extraHeaderSpacing;
      }
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.text(recipe.title, margin, y);
      y += 24;
  
      doc.setFont('times', 'normal');
      doc.setFontSize(14);
      if (y + lineSpacing > pageHeight - margin) {
        doc.addPage();
        drawHeader();
        y = margin + headerHeight + extraHeaderSpacing;
      }
      doc.text('Ingredients:', margin, y);
      y += lineSpacing;

      const ingredients = recipe.extendedIngredients
        ? recipe.extendedIngredients.map(i => i.original)
        : recipe.ingredients || [];
      ingredients.forEach(lineText => {
        const lines = doc.splitTextToSize(
          `- ${lineText}`,
          pageWidth - margin * 2
        );
        if (y + lines.length * lineSpacing > pageHeight - margin) {
          doc.addPage();
          drawHeader();
          y = margin + headerHeight;
        }
        doc.text(lines, margin, y);
        y += lines.length * lineSpacing;
      });
      y += lineSpacing;
  
      if (y + lineSpacing > pageHeight - margin) {
        doc.addPage();
        drawHeader();
        y = margin + headerHeight;
      }
      doc.text('Directions:', margin, y);
      y += lineSpacing;
  
      const steps = recipe.analyzedInstructions?.[0]?.steps
        ? recipe.analyzedInstructions[0].steps.map(s => `${s.number}. ${s.step}`)
        : (typeof recipe.instructions === 'string'
            ? [recipe.instructions]
            : recipe.instructions || []);
      steps.forEach(stepText => {
        const lines = doc.splitTextToSize(
          stepText,
          pageWidth - margin * 2
        );
        if (y + lines.length * lineSpacing > pageHeight - margin) {
          doc.addPage();
          drawHeader();
          y = margin + headerHeight;
        }
        doc.text(lines, margin, y);
        y += lines.length * lineSpacing;
      });
    });
  
    const fileName = `${cookbook?.title?.replace(/\s+/g, '_') || 'cookbook'}.pdf`;
    doc.save(fileName);
  };
  

  return (
    <div className="back max-w-6xl mx-auto p-6 pb-20">
      <Toaster position='top-right' />
      {loading ? (
        <div className="space-y-6 animate-pulse text-left">
          <div className="pl-4 space-y-2">
            <div className="h-12 bg-gray-200 rounded w-3/5" />
            <div className="h-6  bg-gray-200 rounded w-1/5" />
          </div>

          <div className="pl-4 flex items-center space-x-4">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-6 bg-gray-200 rounded w-32 pb-4" />
          </div>

          <div className="pl-4 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="space-y-4">
                <div className="h-48 bg-gray-200 rounded-lg" />
                <div className="h-4  bg-gray-200 rounded w-3/4" />
                <div className="h-4  bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
        <div className="text-left mb-6 font-serif">
          <h1 className="text-4xl font-semibold text-teal-800 mb-2">{cookbook.title}</h1>
          <p className="text-gray-500 text-sm">
            {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'}
          </p>
        </div>
        {ownerUsernames.length > 0 && (
          <div className="text-gray-600 mb-2 text-sm">
            {ownerUsernames.length === 1 ? 'Owner' : 'Owners'}:{' '}
            {ownerUsernames.map((username, idx) => (
              <Link
                key={username}
                to={`/profile/${username}`}
                className="text-teal-600 hover:underline"
              >
                {username}{idx < ownerUsernames.length - 1 ? ', ' : ''}
              </Link>
            ))}
          </div>
        )}
        {isOwner && (
          <div className="text-gray-600 mb-2 text-sm">
          <button
            className="mb-4 bg-teal-500 hover:bg-teal-700 text-white px-4 py-2 mr-2 rounded"
            onClick={() => setInviteMode(true)}
          >
            + Add collaborator
          </button>
          <button
            onClick={downloadPdf}
            className="mb-6 bg-teal-500 hover:bg-teal-700 text-white px-4 py-2 ml-2 rounded"
          >
            Download PDF
          </button>
          </div>
          
        )}
        {isOwner && inviteMode && (
          <InviteModal
            cookbookId={id}
            currentUsername={currentUsername}
            onClose={() => setInviteMode(false)}
            onInviteSuccess={async () => {
              toast.success('Collaborator added!');
              setInviteMode(false);
              await fetchCookbook();
            }}
          />
        )}
        {cookbook.recipes.length === 0 && isOwner ? (
          <div className="text-center mt-4 font-serif border-t-2">
          <p className="text-gray-600 text-lg mt-8 my-2">This cookbook doesn't have any recipes yet.</p>
          <Link to="/" className="text-teal-600 hover:text-teal-700 underline">
            Browse Recipes
          </Link>
          </div>
        ) : (
        <div id="cookbook-content" className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t-2 pt-6">
          {recipes.length > 0 ? (
            recipes.map((recipe) => {
              if (!recipe || !recipe.title) return null;
              return (
                <div key={recipe.id} className="relative group">
                <div
                  onClick={() => {
                    setSelectedRecipeId(recipe.id);
                    setShowModal(true);
                  }}
                  className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden block cursor-pointer"
                >
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={recipe.isUser ? `data:image/jpeg;base64,${recipe.image}` : recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {recipe.readyInMinutes !== undefined
                        ? `${recipe.readyInMinutes} min`
                        : recipe.prepTime || recipe.cookTime
                        ? `${recipe.prepTime + recipe.cookTime} min`
                        : "No time info"}{" "}
                      |{" "}
                      {recipe.servings ? `Serves ${recipe.servings}` : "No servings info"}
                    </p>
                  </div>
                  </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveRecipe(recipe.id)}
                    className="absolute top-2 right-2 bg-white/80 text-gray-500 hover:text-red-600 p-2 rounded-full z-50 opacity-0 group-hover:opacity-100 transition"
                    title="Remove from cookbook"
                  >
                    <FaTrash />
                  </button>
                )}
                </div>
              );
            }
          )
            ) : (
              <p className="text-center text-gray-600 col-span-full mt-4 pt-6 text-lg font-serif">
                No visible recipes in this cookbook.
              </p>
            )}
        </div>
        )}
          </>
        )}
        {showModal && selectedRecipeId && (
          <Modal onClose={() => {
            setShowModal(false);
            setSelectedRecipeId(null);
          }}>
            <RecipeDetailPage recipeId={selectedRecipeId} />
          </Modal>
        )}
    </div>
  );
}

export default CookbookDetailPage;