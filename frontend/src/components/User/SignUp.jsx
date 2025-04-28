import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import TopBar from '../TopBar/TopBar';

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

function SignUp({ onSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [bio, setBio] = useState('');
  const [intolerances, setIntolerances] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const values = intolerances.map(i => i.value);
      const { data } = await axios.post('/api/register', {
        username,
        password,
        fName,
        lName,
        bio,
        intolerances: values
      });
      if (data.error) {
        console.log(data.error);
      } else {
        setUsername('');
        setPassword('');
        setFName('');
        setLName('');
        setBio('');
        setIntolerances([]);
        localStorage.setItem('token', data.token);
        onSignUp();
        navigate('/home');
      }
    } catch (err) {
      console.error('Error signing up:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e4f1f0]">
      <TopBar onLogout={() => {}} />

      <div className="flex flex-1 justify-center items-center px-4 pt-12">
        <div className="flex flex-col md:flex-row bg-white bg-opacity-70 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden w-full max-w-5xl mx-auto">

          <div className="w-full md:w-2/3 p-10">
            <h1 className="text-4xl font-serif font-extrabold mb-4 text-center text-teal-700">WhiskAway</h1>
            <p className="text-center text-gray-700 font-serif mb-8 border-b pb-4 mx-12">Create your free account to start finding great recipes!</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
                <div>
                  <label htmlFor="username" className="block text-gray-700 mb-1">Username*</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-gray-700 mb-1">Password*</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
                <div>
                  <label htmlFor="fName" className="block text-gray-700 mb-1">First Name*</label>
                  <input
                    id="fName"
                    type="text"
                    placeholder="First Name"
                    value={fName}
                    onChange={e => setFName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label htmlFor="lName" className="block text-gray-700 mb-1">Last Name*</label>
                  <input
                    id="lName"
                    type="text"
                    placeholder="Last Name"
                    value={lName}
                    onChange={e => setLName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="bio" className="block text-gray-700 font-serif mb-1">Bio</label>
                  <input
                    id="bio"
                    type="text"
                    placeholder="Write about yourself..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="w-full px-4 py-2 border font-serif text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <p className="text-gray-700 font-serif mb-2">Select dietary intolerances</p>
                  <Select
                    isMulti
                    options={intoleranceOptions}
                    value={intoleranceOptions.filter(opt =>
                      intolerances.includes(opt.value)
                    )}
                    onChange={selected =>
                      setIntolerances(selected.map(opt => opt.value))
                    }
                    classNamePrefix="custom"
                    classNames={{
                      control: () =>
                        'border border-teal-500 px-2 py-1 rounded-md shadow-none',
                      option: state =>
                        state.isSelected
                          ? 'bg-teal-100 text-teal-800 font-medium px-3 py-2 text-sm cursor-pointer'
                          : state.isFocused
                          ? 'bg-teal-50 text-teal-700 px-3 py-2 text-sm cursor-pointer'
                          : 'text-gray-700 px-3 py-2 text-sm cursor-pointer',
                      multiValue: () =>
                        'bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded-full',
                      multiValueRemove: () =>
                        'ml-1 text-teal-500 cursor-pointer rounded-full'
                    }}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        boxShadow: 'none',
                        borderColor: state.isFocused ? '#14b8a6' : '#d1d5db',
                        '&:hover': { borderColor: '#14b8a6' }
                      })
                    }}
                    className="text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 font-serif bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-transform transform hover:scale-105 duration-300"
              >
                Sign Up
              </button>
            </form>

            <p className="text-center text-gray-700 font-serif mt-6">Already have an account?{' '}
              <Link to="/login" className="text-teal-500 hover:underline">Log In</Link>
            </p>
          </div>

          <div className="hidden md:block md:w-1/3">
            <img
              src="/salad.jpg"
              alt="Delicious recipes"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;