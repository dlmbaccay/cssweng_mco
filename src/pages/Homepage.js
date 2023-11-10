import React, { useState } from 'react'
import NavBar from '../components/NavBar';
import PostSnippet from '../components/PostSnippet';
import { FaQuestion, FaEnvelope } from 'react-icons/fa';
import { BsBookmarkFill } from 'react-icons/bs';
import { LiaShoppingCartSolid } from 'react-icons/lia';
import { IoMdSearch } from 'react-icons/io';
import { IconContext } from "react-icons";

export default function HomePage(){
    return(
        <div className = 'bg-gray flex flex-row min-h-screen h-screen w-full'>
            {/* NavBar */}
            <div className='min-h-screen sticky'>
                <NavBar/>
            </div>
            
            <div className='min-h-screen w-full flex flex-col items-center'>
                {/* Top Rectangle */}
                <div className="sticky flex flex-row items-center justify-between w-full h-20 pl-5  bg-snow drop-shadow-xl">
                        {/* Search Bar */}
                        <div className="mr-10 w-80 h-10 bg-dark_gray rounded-[30px] flex flex-row items-center ">
                            <div className="items-center justify-left flex flex-row ml-4">
                                    <IoMdSearch style={{ color: "#898989", fontSize: "20px"}} />
                            </div>
                            <input type="text" className="bg-transparent w-full h-full pl-2 text-raisin_black text-xl font-semibold focus:outline-none" placeholder="Search"/>
                        </div>
                        <div className='flex flex-row mr-3'>
                        {/* App Name */}
                        <span className=" mr-4 pl-10 top-3 font-semibold focus:outline-none text-[30px]">BantayBuddy</span>
                        {/* Icon */}
                        <div className="w-12 h-12 bg-dark_gray rounded-[30px]"></div>
                        </div>
                </div>
                <div className='flex flex-col justify-center items-center overflow-y-scroll scrollbar-hide overflow-hidden'>
                    <div className='bg-snow w-full max-w-5xl h-60 mr-40 ml-40 mt-20 justify-between flex flex-col drop-shadow-xl rounded-[30px]'>
                        <div className='flex flex-row'>
                            {/* Profile Picture */}
                            <div className="ml-10 mt-8 w-[145px] h-[115px] bg-dark_gray rounded-full"></div>
                            {/* Write Post */}
                            <div className=" w-full ml-10 h-[115px] max-w-1xl mt-8 mb-8 mr-[40px] bg-dark_gray rounded-[30px]"> 
                                <input type="text" className="bg-transparent w-full h-full pl-10 text-raisin_black text-xl font-semibold focus:outline-none" placeholder="Write a post..."/>
                            </div>
                        </div>
                        <div className='flex flex-row gap-2 justify-center mb-10 border-dark_gray items-center'>
                            {/* Buttons */}
                            <div className='outline outline-2 outline-dark_gray py-2 px-24 rounded-l-[10px]'>
                                <h1>Media</h1>
                            </div>
                            <div className='outline outline-2 outline-dark_gray py-2 px-24'>
                                <h1>Tag</h1>
                            </div>
                            <div className='outline outline-2 outline-dark_gray py-2 px-20'>
                                <h1>Check-in</h1>
                            </div>
                            <div className='outline outline-2 outline-dark_gray py-2 px-24 rounded-r-[10px]'>
                                <h1>Post</h1>
                            </div>
                        </div>
                    </div>
                    {/* Posts */}
                    <div 
                        id="showcase" 
                        className="flex justify-center w-full max-w-[859px] rounded-[20px] m-8"
                    >
                        <div className="flex flex-col h-fit max-h-[510px]">
                            <div className="mb-8">
                                <PostSnippet
                                    username='barknplay'
                                    displayName='Barker'
                                    publish_date='Sept 6 at 4:30 PM'    
                                    desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                        Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                        🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                    user_img_src='/images/user1-image.png'
                                    post_img_src='/images/post1-image.png'
                                />
                            </div>
                            <div className="mb-8">
                                <PostSnippet
                                    username='barknplay'
                                    displayName='Barker'
                                    publish_date='Sept 6 at 4:30 PM'    
                                    desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                        Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                        🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                    user_img_src='/images/user1-image.png'
                                    post_img_src='/images/post1-image.png'
                                />
                            </div>
                            <div className="mb-8">
                                <PostSnippet
                                    username='barknplay'
                                    displayName='Barker'
                                    publish_date='Sept 6 at 4:30 PM'    
                                    desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                        Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                        🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                    user_img_src='/images/user1-image.png'
                                    post_img_src='/images/post1-image.png'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Right Navbar */}
            <div className="sticky flex flex-col h-screen min-h-screen items-left justify-left w-90 pr-10 bg-snow drop-shadow-xl">
                <span className="pl-10 mt-10 pr-20 font-bold focus:outline-none text-[35px] text-mustard">Menu</span>
                <div className="flex flex-row">
                    <div className='ml-10 mt-3'>
                        {/* green circle */}
                        <div className="w-12 h-12 bg-grass rounded-full ">
                            <div className='pt-[11px] pl-[11px]'>
                                    <FaQuestion style={{ fontSize: "25px", color: "#F5F0F0" }}/>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-2 font-regular focus:outline-none text-[20px] text-grass">Pet Tracker</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-9 mt-3 pl-1'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                        <div className='pt-[11px] pl-[11px]'>
                                    <FaEnvelope style={{ fontSize: "25px", color: "#F5F0F0" }}/>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-3 font-regular focus:outline-none text-[20px] text-grass">Messages</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-10 mt-3'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                            <div className='pt-[11px] pl-[11px]'>
                                    <BsBookmarkFill style={{ fontSize: "25px", color: "#F5F0F0" }}/>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-2 font-regular focus:outline-none text-[20px] text-grass">Saved Posts</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-10 mt-3'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                            <div className='pt-[8px] pl-[6px]'>
                                    <LiaShoppingCartSolid style={{ fontSize: "35px", color: "#F5F0F0" }} />
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-2 font-regular focus:outline-none text-[20px] text-grass">Shops</span>
                </div>
                <div className="border-b-2 border-dark_gray mt-10 ml-10"></div>
                <span className="pl-10 mt-10 pr-20 font-bold focus:outline-none text-[35px] text-mustard ">Events</span>
            </div>
        </div>

    )
}