// client/src/components/About.jsx

import React from 'react';

function About() {
    return (
        <div className="about mx-4"> 
            <div className='mb-4'>
                <span className='font-semibold text-2xl'>Ongoing list of stuff to add</span>
            </div>
            <div className='bg-red-300'>
                <span className='text-xl font-bold text-red-600'>High Importance:</span>
            </div>
            <p>registration form</p>
            <br></br>
            <div className='bg-gray-200'>
                <span className='text-xl'>Profile Section:</span>
            </div>
            <p>fName</p>
            <p>lName</p>
            <p>Profile Picture saving & displaying</p>
            <p>bio</p>
            <p>friends</p>
            <br></br>
            <div className='bg-gray-200'>
                <span className='text-xl'>HomePage Section:</span>
            </div>
            <p>design UI better</p>
            <br></br>
            <div className='bg-gray-200'>
                <span className='text-xl'>Database</span>
            </div>
            <p>profile picture</p>
            <p>allergens</p>
            <p>dietary restrictions</p>
            <p>new table for cookbooks</p>
            <br></br>
            <div className='bg-gray-200'>
                <span className='text-xl'>Cookbooks</span>
            </div>
            <p>Cookbook object</p>
            <p>assign recipes to cookbook</p>
            <p>Styling for cookbook</p>
            <p>clickability for cookbook similar to recipes</p>
            <p>adding multiple users for cookbook (owner, editor)</p>
            <br></br>
            <div className='pb-24'></div>
        </div>
    );
}

export default About;
