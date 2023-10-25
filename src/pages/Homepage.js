import React, { useState } from 'react'
import Navbar from '../components/Navbar';
import Post from '../components/Post'

export default function Homepage(){
    return(
        
        <div className = 'bg-gray flex flex-row min-h-screen h-full w-full'>
            {/* Navbar */}
            <div className='min-h-screen sticky'>
                <Navbar/>
            </div>
            
            <div className='min-h-screen w-full flex flex-col items-center'>
                {/* Top Rectangle */}
                <div className="sticky flex flex-row items-center justify-between w-full h-20 pl-5  bg-snow drop-shadow-xl">
                        {/* Search Bar */}
                        <div className="mr-10 w-80 h-10 bg-dark_gray rounded-[30px]"> 
                            <input type="text" className="bg-transparent w-full h-full pl-10 text-raisin_black text-xl font-semibold focus:outline-none" placeholder="Search"/>
                        </div>
                        <div className='flex flex-row mr-3'>
                        {/* App Name */}
                        <span className=" mr-4 pl-10 top-3 font-semibold focus:outline-none text-[30px]">App Name</span>
                        {/* Icon */}
                        <div className="w-12 h-12 bg-dark_gray rounded-[30px]"></div>
                        </div>
                </div>
                <div className='flex flex-col justify-center items-center overflow-y-scroll scrollbar-hide'>
                    <div className='bg-snow w-full max-w-5xl h-60 mr-40 ml-40 mt-20 justify-between flex flex-col drop-shadow-xl rounded-[30px]'>
                        <div className='flex flex-row'>
                            {/* Profile Picture */}
                            <div className="ml-10 mt-11 w-[145px] h-[115px] bg-dark_gray rounded-full"></div>
                            {/* Write Post */}
                            <div className="top-4  w-full ml-10 h-[120px] max-w-1xl mt-10 mr-[40px] bg-dark_gray rounded-[30px]"> 
                                <input type="text" className="bg-transparent w-full h-full pl-10 text-raisin_black text-xl font-semibold focus:outline-none" placeholder="Write a post..."/>
                            </div>
                        </div>
                        <div className='flex flex-row justify-between mb-3 ml-4 mr-10 border-t-2 border-dark_gray items-center'>
                            {/* Buttons */}
                            <span className="pl-10 top-3 pr-20 font-regular focus:outline-none text-[23px] text-raisin_black border-r-2 border-dark_gray">Media</span>
                            <span className="pl-10 top-3 pr-20 font-regular focus:outline-none text-[23px] text-raisin_black border-r-2 border-dark_gray">Tag</span>
                            <span className="pl-10 top-3 pr-20 font-regular focus:outline-none text-[23px] text-raisin_black border-r-2 border-dark_gray">Check-In</span>
                            <span className="pl-10 top-3 pr-20 font-regular focus:outline-none text-[23px] text-raisin_black">Post</span>
                        </div>
                    </div>
                    {/* Posts */}
                    <div 
                        id="showcase" 
                        className="flex justify-center w-full max-w-[859px] rounded-[20px] m-8"
                    >
                        <div class="flex flex-col h-fit max-h-[510px]">
                            <Post 
                                username='barknplay'
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src='/images/user1-image.png'
                                post_img_src='/images/post1-image.png'
                            />
                            {/* space lang po to sorry po */}
                            <div class="m-4"></div>
                            <Post
                                username='barknplay'
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src='/images/user1-image.png'
                                post_img_src='/images/post1-image.png'
                            />
                            <div class="m-4"></div>
                            <Post
                                username='barknplay'
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src='/images/user1-image.png'
                                post_img_src='/images/post1-image.png'
                                className='m-4'
                            />
                        </div>
                    </div>
                </div>
            </div>
            
        </div>

    )
}

