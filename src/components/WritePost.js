import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5';
import { IconContext } from "react-icons";

export default function WritePost() {
    return(
        <div className='flex flex-col justify-center items-center w-screen h-screen bg-black'>
            <div className='bg-snow w-[537px] h-[390px] drop-shadow-xl flex flex-col rounded-[20px]'>
                <div className='flex flex-row justify-between items-center py-3 px-5 ml-[200px] text-[20px]'>
                    <span>Write a Post</span>
                    <div>
                    <IconContext.Provider value={{ color: "#787878", size: "30px"}}>
                        <IoClose />
                    </IconContext.Provider>
                    </div>
                </div>

                <div className='flex flex-row justify-left items-center ml-8'>
                    <div className="w-[67px] h-[67px] bg-dark_gray rounded-full"></div>
                    <div className="flex flex-col">
                        <div className='pl-3 mb-2 space-y-2'>
                            <h1 className='font-bold text-[18px]'>petwhisperer</h1>
                            <div className='flex flex-row text-[16px] space-x-3'>
                                <div className="flex justify-center items-center w-[111px] h-[23px] bg-dark_gray rounded-[5px] ">
                                    <h1>Categories</h1>
                                </div>
                                <div className="flex justify-center items-center w-[111px] h-[23px] bg-dark_gray rounded-[5px] ">
                                    <h1>Pets</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='text-neutral-400 mt-5 ml-9'>
                    <h1>What's on your mind?</h1>
                </div>

                <div className='flex flex-row justify-between items-center w-[496px] h-[39px] rounded-[10px] ml-5 mt-28 text-[20px]'>
                   <div className='outline outline-2 outline-dark_gray py-1 px-14 rounded-l-[10px]'>
                      <h1>Media</h1>
                   </div>
                   <div className='outline outline-2 outline-dark_gray py-1 px-14'>
                      <h1>Tag</h1>
                   </div>
                   <div className='outline outline-2 outline-dark_gray py-1 px-12  rounded-r-[10px]'>
                      <h1>Check-in</h1>
                   </div>
                </div>

                <button className='flex items-center justify-center bg-xanthous border-xanthous border-2 w-[496px] h-[39px] rounded-[10px] ml-5 mt-3'>
                    <h1 className='font-bold text-snow text-[20px]'>Post</h1>
                </button>
            </div>
        </div>

        
    )
}