import React from 'react'
import RoundIcon from './RoundIcon';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { useUserData } from '../lib/hooks';

function handleLogOut() {
  auth.signOut().then(() => {
    window.location.href = "/Login";
  });
}

function handleHome() {
  window.location.href = "/Home";
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
      className={`sticky z-10 bg-pale_yellow text-white w-16 h-screen flex flex-col items-center transition-all ${
        isSidebarExpanded ? "w-48" : "w-16"
      }`}
    >
      {/* Circular profile picture (always visible) */}
      <div 
        // className="w-10 h-10 rounded-full bg-white mt-8 cursor-pointer"  
        className={`w-10 h-10 rounded-full bg-white mt-8 cursor-pointer transition-all ${
          isSidebarExpanded ? "w-10 h-10 mr-32" : ""
        }`}
        onClick={() => window.location.href = "/user/"+username}>
          {userPhotoURL && <RoundIcon src={userPhotoURL}  width="100%" height="100%" />}
          
          {isSidebarExpanded && (
                <span className="ml-12 -mt-8 flex items-center font-medium text-raisin_black hover:text-grass">
                  Profile
                </span>
              )}
      </div>
      
      

      {/* Sidebar content*/}
      <div
        className={`flex flex-col items-center mt-auto mb-10 transition-all ${
          isSidebarExpanded ? "w-48 pr-32" : "w-16 flex flex-col items-center"
        }`}
      >
        {/* Toggle button */}
        {/* <button
          onClick={toggleSidebar}
          className="w-7 h-7 rounded-full bg-white text-black mb-4"
        >
          {isSidebarExpanded ? (
            <RoundIcon src="/images/rightarrow-icon.png"  width="100%" height="100%"/>
          ) : (
            <RoundIcon src="/images/leftarrow-icon.png"  width="100%" height="100%"/>
          )}
        </button> */}

        {/* Home Button */}
        <a href="#" onClick={handleHome} className="flex items-center space-x-2">
          <button
            onClick={handleHome}
            className={`w-7 h-7 rounded-full bg-white mb-4 text-black hover:text-grass ${
              isSidebarExpanded ? "w-10 h-10" : ""
            }`}
          >
            <RoundIcon src="/images/home-icon.png" width="100%" height="100%" />
            {isSidebarExpanded && (
              <span className="ml-10 -mt-6 flex items-center font-medium">
                Home
              </span>
            )}
          </button>
        </a>
        
        {/* Groups */}
        <a href="#" className="flex items-center space-x-2">
          <button
            className={`w-7 h-7 rounded-full bg-white mb-4 text-black hover:text-grass ${
              isSidebarExpanded ? "w-10 h-10" : ""
            }`}
          >
            <RoundIcon src="/images/groups-icon.png" width="100%" height="100%" />
            {isSidebarExpanded && (
              <span className="ml-10 -mt-6 flex items-center font-medium">
                Groups
              </span>
            )}
          </button>
        </a>

        {/* Foundations */}
        <a href="#" className="flex items-center space-x-2">
          <button
            className={`w-7 h-7 rounded-full bg-white mb-4 text-black hover:text-grass ${
              isSidebarExpanded ? "w-10 h-10" : ""
            }`}
          >
            <RoundIcon src="/images/foundations-icon.png" width="100%" height="100%" />
            {isSidebarExpanded && (
              <span className="ml-10 -mt-6 flex items-center font-medium">
                Foundations
              </span>
            )}
          </button>
        </a>

        {/* Notifications */}
        <a href="#" className="flex items-center space-x-2">
          <button
            className={`w-7 h-7 rounded-full bg-white mb-4 text-black hover:text-grass ${
              isSidebarExpanded ? "w-10 h-10" : ""
            }`}
          >
            <RoundIcon src="/images/notifications-icon.png" width="100%" height="100%" />
            {isSidebarExpanded && (
              <span className="ml-10 -mt-6 flex items-center font-medium">
                Notifications
              </span>
            )}
          </button>
        </a>

        {/* Settings */}
        <a href="#" className="flex items-center space-x-2">
          <button
            className={`w-7 h-7 rounded-full bg-white mb-4 text-black hover:text-grass ${
              isSidebarExpanded ? "w-10 h-10" : ""
            }`}
          >
            <RoundIcon src="/images/settings-icon.png" width="100%" height="100%" />
            {isSidebarExpanded && (
              <span className="ml-10 -mt-6 flex items-center font-medium">
                Settings
              </span>
            )}
          </button>
        </a>
        
        <hr
          className={`border-t my-2 mx-auto transition-all w-${
            isSidebarExpanded ? 48 : 16
          } border-citron`}
        />

        {/* Log Out */}
        <a href="#" className="flex items-center space-x-2">
          <button
            onClick={handleLogOut}
            className={`w-7 h-7 rounded-full bg-white mt-4 text-black hover:text-grass ${
              isSidebarExpanded ? "w-10 h-10" : ""
            }`}
          >
            <RoundIcon src="/images/logout-icon.png" width="100%" height="100%" />
            {isSidebarExpanded && (
              <span className="ml-10 -mt-6 flex items-center font-medium">
                Logout
              </span>
            )}
          </button>
        </a>
      </div>
    </nav>
  );
}
