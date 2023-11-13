import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5';
import { IconContext } from "react-icons";

/* this is just here para madali siya maaccess but i added this na rin sa components */

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
                                    <select name="category" id="category" placeholder='Categories' className='bg-dark_gray'>
                                        <option value="" disable selected>Categories</option>
                                        <option value="qa">Q&A</option>
                                        <option value="tips">Tips</option>
                                        <option value="petNeeds">Pet Needs</option>
                                        <option value="lostPets">Lost Pets</option>
                                        <option value="foundPets">Found Pets</option>
                                        <option value="foundPets">Milestones</option>
                                    </select>
                                   {/*  <h1>Categories</h1> */}
                                </div>
                                <div className="flex justify-center items-center w-[111px] h-[23px] bg-dark_gray rounded-[5px] ">
                                    <select name="category" id="category" className='bg-dark_gray '>
                                        <option value="" disable selected>Pets</option>
                                        <option value="samplepet">Sample Pet</option>
                                    </select>
                                    {/* <h1>Pets</h1> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex text-neutral-400 mt-5 ml-9'>
                    <input type='text' placeholder='What`s on your mind?' className='outline-none bg-snow text-raisin_black w-full pr-9'></input>
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