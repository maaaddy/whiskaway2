import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar2 from '../TopBar2/TopBar2';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/login', { username, password });
      if (data.error) {
        console.log(data.error);
      } else {
        setUsername('');
        setPassword('');
        localStorage.setItem('token', data.token);
        onLogin();
        navigate('/home');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e4f1f0]">
      <TopBar2 />

      <div className="flex flex-1 justify-center items-center px-4 pt-10">
        <div className="flex flex-col md:flex-row bg-white bg-opacity-70 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full">

          <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10 text-gray-800">
            <h1 className="text-4xl font-serif font-extrabold mb-4 text-teal-700">WhiskAway</h1>
            <p className="text-base font-serif text-center mb-8 text-gray-700  pb-4 border-b">
                Recipe finding made easy. Welcome back!
            </p>
            <span className="text-2xl font-serif font-bold text-teal-700 mt-2 mb-4">Log In</span>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full max-w-sm font-serif">
              <div className="form-group">
                <label htmlFor="username" className="block text-gray-700 mb-1">
                  Username:
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="block text-gray-700 mb-1">
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-transform transform hover:scale-105 duration-300"
              >
                Log In
              </button>
            </form>

            <div className="mt-6 text-gray-700">
              <span className='font-serif font-thin'>Don't have an account?</span>
              <Link to="/signup" className="text-teal-500 font-serif font-thin hover:underline ml-1">
                Sign Up
              </Link>
            </div>
          </div>

          <div className="hidden md:block w-full md:w-1/2">
            <img
              src="/cookbook.jpg"
              alt="Recipe Background"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
