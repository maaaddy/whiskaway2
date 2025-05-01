import React from 'react';
import { Link } from 'react-router-dom';

export default function TopBar2() {
  return (
    <div className="fixed w-full bg-white backdrop-blur-md shadow-sm py-1 px-6 flex items-center justify-between z-50">
      <Link to="/" className="flex items-center space-x-3">
        <img src="/whiskaway.png" alt="Logo" className="w-9 h-auto" />
        <span className="text-xl text-teal-700 font-semibold font-serif">
          WhiskAway
        </span>
      </Link>

      <div className="flex items-center space-x-4">
        <Link
          to="/login"
          className="px-4 py-2 bg-teal-100 text-teal-700 font-semibold hover:bg-teal-200 rounded-full"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-teal-700 text-white font-semibold rounded-full hover:bg-teal-600"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
