import React from 'react'
import Image from 'next/image';



export default function Notifications() {
    return (
        <div className="flex flex-col w-full md:w-1/4 md:ml-left items-center md:justify-center md:text-left bg-snow drop-shadow-xl rounded-xl">
            <div className="flex flex-row items-center justify-stretch">
               <div className="text-3xl font-bold mt-5 text-mustard">Notifications</div>
           </div>
                <hr className="border-1 border-dark_gray my-5 w-full h-1" />

                <div className="flex flex-col gap-4 justify-center items-left">
                    <div className="flex items-center p-4">
                        <Image src="/images/user1-image.png" width={100} height={100} alt="user-image" className="w-16 h-16 mr-4 rounded-full" />
                        <div>
                            <div style={{ wordWrap: 'break-word' }}>
                                <span className="text-raisin font-bold">barknplay</span> 
                                <span className="text-raisin" contentEditable="true"> followed you! Follow her back!</span>
                            </div>
                            <p className='mt-1 text-xs text-raisin'>Oct 6, 2023</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4">
                        <Image src="/images/user0-image.png" width={100} height={100} alt="user-image" className="w-16 h-16 mr-4 rounded-full" />
                        <div>
                            <div style={{ wordWrap: 'break-word' }}>
                                <span className="text-raisin font-bold">tailwagger</span> 
                                <span className="text-raisin" contentEditable="true"> liked a post that you uploaded!</span>
                            </div>
                            <p className='mt-1 text-xs text-raisin'>Sept 26, 2023</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4">
                        <Image src="/images/user0-image.png" width={100} height={100} alt="user-image" className="w-16 h-16 mr-4 rounded-full" />
                        <div>
                            <div style={{ overflowWrap: 'break-word' }}>
                                <span className="text-raisin font-bold">tayor</span> 
                                <span className="text-raisin" contentEditable="true"> commented on a post that you uploaded!</span>
                            </div>
                            <p className='mt-1 text-xs text-raisin'>Sept 26, 2023</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4">
                        <Image src="/images/user1-image.png" width={100} height={100} alt="user-image" className="w-16 h-16 mr-4 rounded-full" />
                        <div>
                            <div style={{ overflowWrap: 'break-word' }}>
                                <span className="text-raisin font-bold">meowmirth</span> 
                                <span className="text-raisin" contentEditable="true"> reacted to your post!</span>
                            </div>
                            <p className='mt-1 text-xs text-raisin'>Sept 26, 2023</p>
                        </div>
                    </div>
                
                </div>
        </div>
    )
}