import React, { useState, useEffect } from 'react'
import NavBar from '../components/NavBar';
import PostSnippet from '../components/PostSnippet';
import { FaQuestion, FaEnvelope } from 'react-icons/fa';
import { BsBookmarkFill } from 'react-icons/bs';
import { LiaShoppingCartSolid } from 'react-icons/lia';
import { IoMdSearch } from 'react-icons/io';
import { IconContext } from "react-icons";

export default function HomePage(){

    useEffect(() => {
      if (document.getElementById('root')) {
        Modal.setAppElement('#root');
      }
    }, []);

    return(
        <div className = 'bg-gray flex flex-row min-h-screen h-screen w-full'>
            {/* NavBar */}
            <div className='min-h-screen sticky'>
                <NavBar/>
            </div>
            
            <div className='min-h-screen w-full flex flex-col items-center'>
                
                <div className='w-full bg-black h-[70px]'>
                </div>


                <div className='flex flex-col w-full justify-center items-center overflow-y-scroll scrollbar-hide overflow-hidden'>
                    {/* Create Post Button */}
                    
                    {/* Posts */}
                   
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