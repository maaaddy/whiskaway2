import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaLock, FaLockOpen, FaTrash, FaPlus } from 'react-icons/fa';
import Modal from '../Modal';

function CookbookPage() {
    const [cookbooks, setCookbooks] = useState([]);
    const [newCookbookTitle, setNewCookbookTitle] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [coverImage, setCoverImage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchCookbooks = async () => {
          try {
            const response = await axios.get('/api/cookbook');
            setCookbooks(response.data);
          } catch (err) {
            console.error('Error fetching cookbooks:', err);
          } finally {
            setIsLoading(false);
          }
        };
        fetchCookbooks();
    }, []);

    const handleCreateCookbook = async () => {
        if (!newCookbookTitle || !coverImage) return;
      
        try {
            const response = await axios.post('/api/cookbook', {
                title: newCookbookTitle,
                isPublic,
                coverImage,
            });
            setCookbooks([...cookbooks, response.data]);
            setNewCookbookTitle('');
            setIsPublic(false);
            setCoverImage('');
            setShowModal(false);
        } catch (err) {
            console.error('Error creating cookbook:', err);
        }
    };

    const handleDeleteCookbook = async (id) => {
      const confirmed = window.confirm(
        'Are you sure you want to delete this cookbook? This action cannot be undone.'
      );
      if (!confirmed) return;
    
      try {
        await axios.delete(`/api/cookbook/${id}`);
        setCookbooks(cookbooks.filter(cookbook => cookbook._id !== id));
      } catch (err) {
        console.error('Error deleting cookbook:', err);
      }
    };
    

    const togglePrivacy = async (id, currentStatus) => {
        try {
            const updatedCookbook = await axios.put(`/api/cookbook/${id}`, { isPublic: !currentStatus });
            setCookbooks(cookbooks.map(cookbook =>
                cookbook._id === id ? { ...cookbook, isPublic: updatedCookbook.data.isPublic } : cookbook
            ));
        } catch (err) {
            console.error('Error updating cookbook privacy:', err);
        }
    };

    return (
      <div className="p-6 max-w-5xl mx-auto py-16 relative">
        <div className="text-center font-serif font-semibold text-2xl text-teal-700 py-2 pb-4">
          <p>Cookbooks</p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="animate-pulse space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
          ) : cookbooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {cookbooks.map((cookbook) => (
              <div
                key={cookbook._id}
                className="relative rounded-lg overflow-hidden shadow hover:shadow-lg transition group h-64 w-52"
              >
                <Link to={`/cookbook/${cookbook._id}`} className="block w-full h-64">
                  <img
                    src={`/${cookbook.coverImage || 'cover1.JPG'}`}
                    alt={`${cookbook.title} Cover`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded-md -translate-y-1/4 text-center">
                      {cookbook.title}
                    </div>
                  </div>
                </Link>
    
                <button
                  onClick={() => handleDeleteCookbook(cookbook._id)}
                  className="absolute top-2 right-2 bg-white/80 text-gray-500 hover:text-red-600 p-1.5 rounded-full z-10 transition"
                >
                  <FaTrash size={16} />
                </button>
                <button
                  onClick={() => togglePrivacy(cookbook._id, cookbook.isPublic)}
                  className="absolute bottom-2 right-2 bg-white/80 text-gray-700 hover:text-gray-900 p-1.5 rounded-full z-10"
                >
                  {cookbook.isPublic ? <FaLockOpen size={18} /> : <FaLock size={18} />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-center text-gray-700">
              No cookbooks created yet. Click{' '}
              <button
                onClick={() => setShowModal(true)}
                className="text-teal-600 underline"
              >
                Create
              </button>{' '}
              to add one.
            </p>
          </div>
        )}
    
        <button
          onClick={() => setShowModal(true)}
          className="
            fixed bottom-6 right-6 
            bg-teal-600 hover:bg-teal-700 
            text-white p-4 rounded-full 
            shadow-lg focus:outline-none mb-16
          "
        >
          <FaPlus/>
        </button>
    
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <div className='p-4'>
            <h2 className="text-2xl font-bold text-center font-serif text-teal-800 mb-6">
              Create a New Cookbook
            </h2>
            <div className="mb-4 items-center justify-center">
              <label className="block text-gray-700 font-serif mb-1">Cookbook Title</label>
              <input
                type="text"
                placeholder="e.g. My Summer Recipes"
                value={newCookbookTitle}
                maxLength={18}
                onChange={(e) => setNewCookbookTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring font-serif focus:ring-blue-200"
              />
              <p className="text-xs text-gray-500 mt-1">{newCookbookTitle.length}/18 characters</p>
            </div>
            <div className="mb-4 font-serif">
              <label className="block text-gray-700 mb-1">Select a Cover</label>
              <div className="grid grid-cols-3 gap-2 justify-items-center pb-3">
                {[...Array(9)].map((_, i) => {
                  const filename = `cover${i + 1}.JPG`;
                  return (
                    <img
                      key={filename}
                      src={`/${filename}`}
                      alt={`Cover ${i + 1}`}
                      className={`cursor-pointer h-60 w-48 rounded-lg border-2 ${
                        coverImage === filename ? 'border-teal-500' : 'border-transparent'
                      }`}
                      onClick={() => setCoverImage(filename)}
                    />
                  );
                })}
              </div>
              {!coverImage && (
                <p className="text-sm text-red-500 mt-1">Please select a cover image.</p>
              )}
            </div>
            <div className="flex items-center justify-between  font-serif">
              <label className="text-gray-700 font-medium">Privacy</label>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className="flex items-center text-gray-700 hover:text-gray-900 transition"
              >
                {isPublic ? <FaLockOpen size={22} className="mr-2" /> : <FaLock size={22} className="mr-2" />}
                {isPublic ? 'Public' : 'Private'}
              </button>
            </div>
            <p className='mb-6 font-serif font-thin text-sm text-gray-600'>Public cookbooks appear on your profile.</p>
            <button
              onClick={handleCreateCookbook}
              disabled={!newCookbookTitle || !coverImage}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-serif font-medium hover:bg-teal-700 transition disabled:opacity-50"
            >
              Create Cookbook
            </button>
            </div>
          </Modal>
        )}
      </div>
    );
}

export default CookbookPage;