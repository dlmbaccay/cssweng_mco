import React from 'react'
import Image from 'next/image';
import Router from 'next/router';

export default function ExpandedNavBar({ props }) {
    
    const { userPhotoURL, username, activePage } = props;
    const router = Router;

    return (
    <div>
        {/* home navbar */}
        <div className='w-full h-screen bg-pale_yellow drop-shadow-xl flex flex-col'>
          
          {/* user meta */}
          <div className='flex flex-col justify-center items-center gap-2 mt-10 mb-8'>
              {<Image src={userPhotoURL} alt={'profile picture'} width={100} height={100} className='rounded-full'/>}

              {<h1 className='text-md font-bold text-raisin_black mt-2'>{username}</h1>}

              <div>
                <button className='bg-grass rounded-lg px-4 py-2 text-xs text-pale_yellow font-bold hover:bg-raisin_black transition-all mt-2 flex items-center justify-center gap-2' onClick={() => router.push(`/user/${username}`)}>
                    <i className='fa-solid fa-user'/>
                    Profile
                </button>
              </div>
          </div>

          <hr className='border border-xanthous opacity-50 ml-6 mr-6'/>

          {/* Home, Groups, Foundations, Notifications, Settings */}
          <div className='flex flex-col mt-6 mb-4'>
            <button 
                onClick={() => {
                    router.push(`/Home`);
                }} 
                className='group flex flex-row items-center gap-2 pl-10 h-16'>
              <i className={`fa-solid fa-home w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-md text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Home' ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass text-lg font-semibold group-hover:text-raisin_black ${activePage === 'Home' ? "text-raisin_black" : ""}`}>Home</p>
           </button>

            <button className='group flex flex-row items-center gap-2 pl-10 h-16 '>
              <i className={`fa-solid fa-user-group w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-md text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Groups' ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass text-lg font-semibold group-hover:text-raisin_black ${activePage === 'Groups' ? "text-raisin_black" : ""}`}>Groups</p>
            </button>

            <button className='group flex flex-row items-center gap-2 pl-10 h-16 '>
              <i className={`fa-solid fa-earth-asia w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-md text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Foundations' ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass text-lg font-semibold group-hover:text-raisin_black ${activePage === 'Foundations' ? "text-raisin_black" : ""}`}>Foundations</p>
            </button>

            <button className='group flex flex-row items-center gap-2 pl-10 h-16 '>
              <i className={`fa-solid fa-bell w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-md text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Notifications' ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass text-lg font-semibold group-hover:text-raisin_black ${activePage === 'Notifications' ? "text-raisin_black" : ""}`}>Notifications</p>
            </button>

            <button 
                onClick={() => {
                    router.push(`/Settings`);
                }}
                className='group flex flex-row items-center gap-2 pl-10 h-16 '
                >
              <i className={`fa-solid fa-gear w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-md text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Settings' ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass text-lg font-semibold group-hover:text-raisin_black ${activePage === 'Settings' ? "text-raisin_black" : ""}`}>Settings</p>
            </button>
          </div>

          <hr className='border border-xanthous opacity-50 ml-6 mr-6'/>

          <div className='mt-4'>
            <button 
              onClick={() => {
                auth.signOut();
                toast.success('Successfully logged out!');
              }} 
              className='group flex flex-row items-center gap-2 pl-10 h-16'
              >
              <i className='fa-solid fa-door-open w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-lg text-pale_yellow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-md font-semibold group-hover:text-raisin_black'>Log Out</p>
           </button>
          </div>
        </div>
    </div>
  )
}
