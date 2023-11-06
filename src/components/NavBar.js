import React from 'react'
import RoundIcon from './RoundIcon';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { useUserData } from '../lib/hooks';
import Link from 'next/link';
import Image from 'next/image';

function handleSignOut() {
  auth.signOut().then(() => {
    window.location.href = "/Login";
  });
}

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
      className={`sticky z-10 bg-pale_yellow text-white w-16 h-screen flex flex-col justify-between items-center transition-all 
      ${isSidebarExpanded ? "w-44" : "w-18"}`}
    >

      <div 
        className={`flex flex-row items-center justify-center h-10 mt-8 cursor-pointer transition-all gap-2
        ${isSidebarExpanded ? "" : "flex justify-center items-center"}`}
        onClick={() => window.location.href = "/user/"+username}
      >
        {userPhotoURL && <Image src={userPhotoURL} alt='user pic' height={35} width={35} className={`rounded-full shadow-lg ${isSidebarExpanded ? "": ""}`}/> }
        
        {isSidebarExpanded && (
          <span className="w-full flex items-center font-medium text-raisin_black hover:text-grass text-lg">
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
          className={`w-full h-7 mb-4 text-black hover:text-grass flex flex-row items-center transition-all
          ${isSidebarExpanded ? "" : ""}`}
        >
          <Image src="/images/home-icon.png" alt="home icon" width={30} height={30} className={` transition-all ${isSidebarExpanded ? "ml-6" : "ml-4"}`}/>
          {isSidebarExpanded && (
            <span className="flex items-center font-medium ml-2 transition-all">
              Home
            </span>
          )}
        </Link>
        
        <Link
          href='/'
          className={`w-full h-7 mb-4 text-black hover:text-grass flex flex-row items-center transition-all
          ${isSidebarExpanded ? "" : ""}`}
        >
          <Image src="/images/groups-icon.png" alt="home icon" width={30} height={30} className={`transition-all ${isSidebarExpanded ? "ml-6" : "ml-4"}`}/>
          {isSidebarExpanded && (
            <span className="flex items-center font-medium ml-2 transition-all">
              Groups
            </span>
          )}
        </Link>
        
        <Link
          href='/'
          className={`w-full h-7 mb-4 text-black hover:text-grass flex flex-row items-center transition-all
          ${isSidebarExpanded ? "" : ""}`}
        >
          <Image src="/images/foundations-icon.png" alt="home icon" width={30} height={30} className={` transition-all ${isSidebarExpanded ? "ml-6" : "ml-4"}`}/>
          {isSidebarExpanded && (
            <span className="flex items-center font-medium ml-2 transition-all">
              Foundations
            </span>
          )}
        </Link>
        
        <Link
          href='/'
          className={`w-full h-7 mb-4 text-black hover:text-grass flex flex-row items-center transition-all
          ${isSidebarExpanded ? "" : ""}`}
        >
          <Image src="/images/notifications-icon.png" alt="home icon" width={30} height={30} className={` transition-all ${isSidebarExpanded ? "ml-6" : "ml-4"}`}/>
          {isSidebarExpanded && (
            <span className="flex items-center font-medium ml-2 transition-all">
              Notifications
            </span>
          )}
        </Link>

        <Link
          href='/Settings'
          className={`w-full h-7 mb-4 text-black hover:text-grass flex flex-row items-center transition-all
          ${isSidebarExpanded ? "" : ""}`}
        >
          <Image src="/images/settings-icon.png" alt="home icon" width={30} height={30} className={` transition-all ${isSidebarExpanded ? "ml-6" : "ml-4"}`}/>
          {isSidebarExpanded && (
            <span className="flex items-center font-medium ml-2 transition-all">
              Settings
            </span>
          )}
        </Link>

        <hr
          className={`transition-all border w-${
            isSidebarExpanded ? 44 : 16
          } border-citron`}
        />

        <button
          onClick={handleSignOut}
          className={`mt-4 w-full h-7 text-black hover:text-grass flex flex-row items-center
          ${isSidebarExpanded ? "" : ""}`}
        >
          <Image src="/images/logout-icon.png" alt="home icon" width={30} height={30} className={`transition-all ${isSidebarExpanded ? "ml-6" : "ml-4"}`}/>
            {isSidebarExpanded && (
            <span className="flex items-center font-medium ml-2  transition-all">
              Logout
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
