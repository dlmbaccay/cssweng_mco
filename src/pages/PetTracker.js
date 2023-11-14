import React, { useState } from 'react'
import Navbar from '../components/Navbar';
import Post from '../components/PostSnippet';
import { FaQuestion, FaEnvelope } from 'react-icons/fa';
import { BsBookmarkFill } from 'react-icons/bs';
import { LiaShoppingCartSolid } from 'react-icons/lia';
import { IoMdSearch } from 'react-icons/io';
import { IconContext } from "react-icons";

export default function PetTracker(){

    const handleTabEvent = (tabName) => {
        setActiveTab(tabName);
    };

    return(
        
        <div className = 'bg-gray flex flex-row min-h-screen h-screen w-full'>
            {/* Navbar */}
            <div className='min-h-screen sticky'>
                <Navbar/>
            </div>
            
            <div className='min-h-screen w-full flex flex-col items-center'>
                {/* Top Rectangle */}
                <div className="sticky flex flex-row items-center justify-between w-full h-20 pl-5  bg-snow drop-shadow-xl">
                        {/* Search Bar */}
                        <div className="mr-10 w-80 h-10 bg-dark_gray rounded-[30px] flex flex-row items-center ">
                            <div className="items-center justify-left flex flex-row ml-4">
                                <IconContext.Provider value={{ color: "#898989", size: "20"}}>
                                    <IoMdSearch />
                                </IconContext.Provider>
                            </div>
                            <input type="text" className="bg-transparent w-full h-full pl-2 text-raisin_black text-xl font-semibold focus:outline-none" placeholder="Search"/>
                        </div>
                        <div className='flex flex-row mr-3'>
                        {/* App Name */}
                        <span className=" mr-4 pl-10 top-3 font-semibold focus:outline-none text-[30px]">App Name</span>
                        {/* Icon */}
                        <div className="w-12 h-12 bg-dark_gray rounded-[30px]"></div>
                        </div>
                </div>
                <div className="sticky flex flex-row w-full h-20 drop-shadow-xl">
                    {/* <p>Lost Pets</p> */}
                    <div id='main-content-container' className='flex flex-col w-full'>
                        <div id="tab-actions" className="flex flex-row bg-snow divide-x divide-neutral-300 border-b border-t border-neutral-300">
                            <button
                                className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none">
                                Lost Pets
                            </button>
                            <button
                            className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none">
                                Found Pets
                            </button>
                        </div>
                    </div>
                    {/* <button className="flex flex-row bg-snow divide-x divide-neutral-300 border-b border-t border-neutral-300 items-center pl-5 pr-5">Lost Pets</button>
                    <button>Found Pets</button> */}
                </div>
                <div className='flex flex-col justify-center items-center overflow-y-scroll scrollbar-hide overflow-hidden pl-10 pr-10'>
                    <div className='bg-snow w-full max-w-5xl h-60 mr-40 ml-40 justify-between flex flex-col drop-shadow-xl rounded-[30px]'>
                        <div className='flex flex-row'>
                            {/* Profile Picture */}
                            <div className="ml-10 mt-8 w-[145px] h-[115px] bg-dark_gray rounded-full"></div>
                            {/* Write Post */}
                            <a href={'/homepage/WritePost'}>
                            <div className=" w-full ml-10 h-[120px] max-w-1xl mt-8 mb-8 mr-[40px] bg-dark_gray rounded-[30px]"> 
                                <input type="text" className="bg-transparent w-full h-full pl-10 text-raisin_black text-xl font-semibold focus:outline-none" placeholder="Write a post..."/>
                            </div>
                            </a>
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
                            {/* Posts here */}
                        </div>
                    </div>
                </div>
            </div>
            {/* Right Navbar */}
            <div className="sticky flex flex-col h-screen min-h-screen items-left justify-left w-90 pr-10 bg-snow drop-shadow-xl">
                <span className="pl-10 mt-10 pr-20 font-bold focus:outline-none text-[35px] text-mustard">Menu</span>
                <div className="flex flex-row bg-pale_yellow pb-3 w-screen">
                    <div className='ml-10 mt-3'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                            <div className='pt-[11px] pl-[11px]'>
                                <IconContext.Provider value={{ color: "#F5F0F0", size: "25"}}>
                                    <FaQuestion />
                                </IconContext.Provider>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-2 font-regular focus:outline-none text-[20px] text-grass">Pet Tracker</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-9 mt-3 pl-1'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                        <div className='pt-[11px] pl-[11px]'>
                                <IconContext.Provider value={{ color: "#F5F0F0", size: "25"}}>
                                    <FaEnvelope />
                                </IconContext.Provider>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-3 font-regular focus:outline-none text-[20px] text-grass">Messages</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-10 mt-3'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                            <div className='pt-[11px] pl-[11px]'>
                                <IconContext.Provider value={{ color: "#F5F0F0", size: "25"}}>
                                    <BsBookmarkFill />
                                </IconContext.Provider>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-2 font-regular focus:outline-none text-[20px] text-grass">Saved Posts</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-10 mt-3'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                            <div className='pt-[8px] pl-[6px]'>
                                <IconContext.Provider value={{ color: "#F5F0F0", size: "35"}}>
                                    <LiaShoppingCartSolid />
                                </IconContext.Provider>
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