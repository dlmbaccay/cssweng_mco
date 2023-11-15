import React from 'react'
import RoundIcon from './RoundIcon';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { useUserData } from '../lib/hooks';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function NavBar() {

  const {username, userPhotoURL } = useUserData();

  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <nav
      onMouseEnter={toggleSidebar}
      onMouseLeave={toggleSidebar}
      className={`sticky z-10 bg-pale_yellow text-white w-16 h-screen flex flex-col justify-between items-center  
      ${isSidebarExpanded ? "w-44" : "w-18"}`}
    >

      <div 
        className={`group flex flex-row items-center justify-center h-10 mt-8 cursor-pointer transition-all gap-2
        ${isSidebarExpanded ? "" : "flex justify-center items-center"}`}
        onClick={() => window.location.href = "/user/"+username}
      >
        {userPhotoURL && <Image src={userPhotoURL} alt='user pic' height={35} width={35} className={`rounded-full shadow-lg ${isSidebarExpanded ? "": ""}`}/> }
        
        {isSidebarExpanded && (
          <span className="w-full flex items-center font-medium text-raisin_black group-hover:text-grass text-sm">
            Profile
          </span>
        )}
      </div>    
      
      <div
        className={`flex flex-col items-center w-full mb-8 transition-all
        ${isSidebarExpanded ? "w-48 flex flex-col items-center" : "w-16 flex flex-col items-center"}`}
      >
        <Link
          href='/Home'
          className='group w-full h-fit flex flex-row mb-4 items-center'  
        >
          <div className={`min-w-[30px] min-h-[30px] bg-grass rounded-full flex justify-center items-center group-hover:bg-raisin_black ${isSidebarExpanded ? "ml-6" : "ml-4"}`}>
            <i className='fa-solid fa-home text-pale_yellow'></i>
          </div>

          {isSidebarExpanded && (
            <p className='text-grass font-semibold ml-2 group-hover:text-raisin_black text-sm'>Home</p>
          )}
        </Link>
        
        <Link
          href='/'
          className='group w-full h-fit flex flex-row mb-4 items-center'  
        >
          <div className={`min-w-[30px] min-h-[30px] bg-grass rounded-full flex justify-center items-center group-hover:bg-raisin_black ${isSidebarExpanded ? "ml-6" : "ml-4"}`}>
            <i className='fa-solid fa-user-group text-sm text-pale_yellow'></i>
          </div>

          {isSidebarExpanded && (
            <p className='text-grass font-semibold ml-2 group-hover:text-raisin_black text-sm'>Groups</p>
          )}
        </Link>

        <Link
          href='/'
          className='group w-full h-fit flex flex-row mb-4 items-center'  
        >
          <div className={`min-w-[30px] min-h-[30px] bg-grass rounded-full flex justify-center items-center group-hover:bg-raisin_black ${isSidebarExpanded ? "ml-6" : "ml-4"}`}>
            <i className='fa-solid fa-earth-asia text-xl text-pale_yellow'></i>
          </div>

          {isSidebarExpanded && (
            <p className='text-grass font-semibold ml-2 group-hover:text-raisin_black text-sm'>Foundations</p>
          )}
        </Link>
        
        <Link
          href='/'
          className='group w-full h-fit flex flex-row mb-4 items-center'  
        >
          <div className={`min-w-[30px] min-h-[30px] bg-grass rounded-full flex justify-center items-center group-hover:bg-raisin_black ${isSidebarExpanded ? "ml-6" : "ml-4"}`}>
            <i className='fa-solid fa-bell text-lg text-pale_yellow'></i>
          </div>

          {isSidebarExpanded && (
            <p className='text-grass font-semibold ml-2 group-hover:text-raisin_black text-sm'>Notifications</p>
          )}
        </Link>

        <Link
          href='/Settings'
          className='group w-full h-fit flex flex-row mb-4 items-center'  
        >
          <div className={`min-w-[30px] min-h-[30px] bg-grass rounded-full flex justify-center items-center group-hover:bg-raisin_black ${isSidebarExpanded ? "ml-6" : "ml-4"}`}>
            <i className='fa-solid fa-gear text-lg text-pale_yellow'></i>
          </div>

          {isSidebarExpanded && (
            <p className='text-grass font-semibold ml-2 group-hover:text-raisin_black text-sm'>Settings</p>
          )}
        </Link>

        <hr
          className={`transition-all border w-${
            isSidebarExpanded ? 44 : 16
          } border-citron`}
        />

        <button 
          onClick={() => {
            auth.signOut();
            toast.success('Successfully logged out!');
          }} 
          className='group w-full h-fit flex flex-row mt-4 items-center'  
          >
          <div className={`min-w-[30px] min-h-[30px] bg-grass rounded-full flex justify-center items-center group-hover:bg-raisin_black ${isSidebarExpanded ? "ml-6" : "ml-4"}`}>
            <i className='fa-solid fa-door-open text-sm text-pale_yellow'></i>
          </div>

          {isSidebarExpanded && (
            <p className='text-grass font-semibold ml-2 group-hover:text-raisin_black text-sm'>Log Out</p>
          )}
        </button>          
      </div>
    </nav>
  );
}
