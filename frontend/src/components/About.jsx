// client/src/components/About.jsx

import React from 'react';

function About() {
    return (
        <div className="back about mx-4"> 
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
            <p>bio character limit</p>
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
            <p>allergens</p>
            <p>dietary restrictions</p>
            <br></br>
            <div className='bg-gray-200'>
                <span className='text-xl'>Cookbooks</span>
            </div>
            <p>Styling for cookbook</p>
            <p>adding multiple users for cookbook (owner, editor)</p>
            <br></br>
            <div className='bg-gray-200'>
                <span className='text-xl'>Other/Random</span>
            </div>
            <p>search for friends only from profile page.</p>
            <p>click to flip recipe card in cookbook. One side is ingredients, one side is recipe instructions.</p>
            <p>pencil icon small for under profile photo to make obvious when editing.</p>
            <p>draw out what the recipe detail page should look like. fr.</p>
            <p>notifications (bell icon?)</p>
            <p>Are you sure? Notification for cookbook deletion</p>
            <p>Are you sure? Notification for recipe removing from cookbook</p>
            <p>Check if public cookbooks are empty, if so, do not display on the person's profile.</p>
            <p>make it so people can't send blank chat messages..</p>
            <div className='pb-24'></div>
        </div>
    );
}

export default About;
