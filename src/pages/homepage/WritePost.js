import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5';
import { IconContext } from "react-icons";

export default function WritePost() {
    return(
        <div className='flex flex-col justify-center items-center w-screen h-screen bg-black'>
            <div className='bg-snow w-[537px] h-[390px] drop-shadow-xl flex flex-col rounded-[35px]'>
                <div className='flex flex-row justify-between items-center p-5 ml-[200px] text-[20px]'>
                    <span>Write a Post</span>
                <div>
                    <IconContext.Provider value={{ color: "#17171F", size: "20"}}>
                        <IoClose />
                    </IconContext.Provider>
                    </div>
                </div>
                <div className='flex flex-row justify-left items-center p-5 ml-3'>
                    <div className="w-[90px] h-[90px] bg-dark_gray rounded-full"></div>
                    <div className="flex flex-col">
                        <div className='p-5 mb-10 font-bold focus:outline-none'>
                            <span>Petwhisperer</span>
                            <div className='flex flex-row'>
                            <div className="w-10 h-10 bg-dark_gray">

                            </div>
                        </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>

        
    )
}