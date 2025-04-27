import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaLock, FaLockOpen } from 'react-icons/fa';

function CookbookPage() {
    const [cookbooks, setCookbooks] = useState([]);
    const [view, setView] = useState('cookbooks');
    const [newCookbookTitle, setNewCookbookTitle] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [coverImage, setCoverImage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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
            setView('cookbooks');
        } catch (err) {
            console.error('Error creating cookbook:', err);
        }
    };

    const handleDeleteCookbook = async (id) => {
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
        <div className="p-6 max-w-5xl mx-auto py-16">
            <div className="flex justify-center space-x-8 mb-6">
                <button
                    className={`text-lg font-medium pb-2 ${view === 'cookbooks' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600'} transition`}
                    onClick={() => setView('cookbooks')}
                >
                    Cookbooks
                </button>
                <button
                    className={`text-lg font-medium pb-2 ${view === 'create' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600'} transition`}
                    onClick={() => setView('create')}
                >
                    Create
                </button>
            </div>

            {view === 'create' ? (
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create a New Cookbook</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Cookbook Title</label>
                        <input 
                            type="text" 
                            placeholder="Enter title..." 
                            value={newCookbookTitle} 
                            onChange={(e) => setNewCookbookTitle(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Select a Cover</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[...Array(9)].map((_, i) => {
                            const filename = `cover${i + 1}.JPG`;
                            return (
                                <img
                                key={filename}
                                src={`/${filename}`}
                                alt={`Cover ${i + 1}`}
                                className={`cursor-pointer rounded-lg border-4 ${coverImage === filename ? 'border-blue-500' : 'border-transparent'}`}
                                onClick={() => setCoverImage(filename)}
                                />
                            );
                            })}
                        </div>
                        {!coverImage && (
                            <p className="text-sm text-red-500 mt-1">Please select a cover image.</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <label className="text-gray-700 font-medium">Privacy</label>
                        <button 
                            onClick={() => setIsPublic(!isPublic)} 
                            className="flex items-center text-gray-700 hover:text-gray-900 transition"
                        >
                            {isPublic ? <FaLockOpen size={22} className="mr-2" /> : <FaLock size={22} className="mr-2" />}
                            {isPublic ? 'Public' : 'Private'}
                        </button>
                    </div>

                    <button 
                        onClick={handleCreateCookbook} 
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                        disabled={!coverImage}
                    >
                        Create Cookbook
                    </button>
                </div>
            ) : (
                isLoading ? (
                  <div className="text-center text-gray-500 py-4">
                    Loading cookbooks…
                  </div>
                ) :
                cookbooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cookbooks.map((cookbook) => (
                      <div
                        key={cookbook._id}
                        className="relative rounded-lg overflow-hidden shadow hover:shadow-lg transition group"
                      >
                        <Link to={`/cookbook/${cookbook._id}`} className="block w-full h-64">
                          <img
                            src={`/${cookbook.coverImage || 'cover1.JPG'}`}
                            alt={`${cookbook.title} Cover`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded-md translate-y-[-20%] text-center">
                              {cookbook.title}
                            </div>
                          </div>
                        </Link>
              
                        <button
                          onClick={() => handleDeleteCookbook(cookbook._id)}
                          className="absolute top-2 right-2 bg-white/80 text-gray-500 hover:text-red-600 p-1.5 rounded-full z-5 transition"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 36 36">
                            <path d="M6,9V31a2.93,2.93,0,0,0,2.86,3H27.09A2.93,2.93,0,0,0,30,31V9Zm9,20H13V14h2Zm8,0H21V14h2Z" />
                            <path d="M30.73,5H23V4A2,2,0,0,0,21,2h-6.2A2,2,0,0,0,13,4V5H5A1,1,0,1,0,5,7H30.73a1,1,0,0,0,0-2Z" />
                            <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
                          </svg>
                        </button>
                        <button
                          onClick={() => togglePrivacy(cookbook._id, cookbook.isPublic)}
                          className="absolute bottom-2 right-2 bg-white/80 text-gray-700 hover:text-gray-900 p-1.5 rounded-full z-5"
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
                        onClick={() => setView('create')}
                        className="text-teal-600 underline"
                      >
                        Create
                      </button>{' '}
                      to add one.
                    </p>
                  </div>
                )
              )
              }
        </div>
    );
}

export default CookbookPage;