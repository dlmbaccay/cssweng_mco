import React, { useState } from 'react'
import Link from 'next/link'
// import Layout from '../../components/Layout';
import Navbar from '../../components/Navbar';

export default function User(){
    return(
        // <Layout>
        //     <div className="p-4">
        //         <h1>Welcome to my website!</h1>
        //         {/* Other content */}
        //     </div>
        // </Layout>
        
        <div className = "flex">
            <Navbar />

            <div className="flex-1 p-8">
                {/* circle */}
                <div className="absolute left-40 top-32 w-32 h-32 rounded-full bg-citron mb-4 z-10"></div>

                {/* Header Picture Rectangle */}
                <div className="absolute left-16 top-0 w-full h-48 bg-gray-300 mb-8 ml-0"></div>

                {/* Left Panel */}
                <div class="absolute -ml-8 top-48 h-screen w-80 bg-snow p-2 border">
                    <div class="absolute inset-y-0 left-0 w-16 ..."></div>

                    {/* Edit button */}
                    <button class="absolute top-0 right-0 mt-4 mr-4 w-16 h-8 flex-shrink-0 bg-citron hover:bg-xanthous text-raisin_black rounded-lg border-none">
                        Edit
                    </button>
                    
                    {/* Username */} 
                    <div class="absolute top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
                        <span class="text-2xl font-bold text-raisin_black">Username</span>
                    </div>
                
                    {/* Followers and Following */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-32 text-center mt-4 flex">
                        <div className="flex flex-col items-center mr-14">
                            <span className="text-raisin_black text-lg font-bold">123</span>
                            <span className="text-gray-500 text-sm">Followers</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-raisin_black text-lg font-bold">69</span>
                            <span className="text-gray-500 text-sm">Following</span>
                        </div>
                    </div>

                    {/* About */}
                    <div class="absolute top-48 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
                        <span class="text-lg font-bold text-raisin_black">About</span>
                    </div>

                    <div class="relative top-64 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
                        <span class="text-base text-raisin_black">
                            <p>
                                🐾 Cat Lover Extraordinaire 🐾 
                                Proud human to a purrfect furball 🐱 
                                Crazy about all things feline
                            </p>
                        </span>
                    </div>
                </div>

                <div className="absolute mt-0 top-48 ml-72 flex flex-row mr-4 w-10/12 bg-snow">
                    <button className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none border">Posts</button>
                    <button className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none border">Pets</button>
                    <button className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none border">Media</button>
                    <button className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none border">Lost Pets</button>
                </div>

            </div>

        </div>
    )
}

