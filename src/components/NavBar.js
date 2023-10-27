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
      className={`sticky z-10 bg-pale_yellow text-white w-16 h-screen flex flex-col items-center transition-all ${
        isSidebarExpanded ? "w-48" : "w-16"
      }`}
    >
      {/* Circular profile picture (always visible) */}
      <div className="w-10 h-10 rounded-full bg-white mt-8 cursor-pointer"  onClick={() => window.location.href = "/user/"+username}>
        {userPhotoURL && <RoundIcon src={userPhotoURL}  width="100%" height="100%" />}
      </div>

      {/* Sidebar content*/}
      <div
        className={`flex flex-col items-center mt-auto mb-10 ${
          isSidebarExpanded ? "w-48" : "w-16"
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="w-7 h-7 rounded-full bg-white text-black mb-4"
        >
          {isSidebarExpanded ? (
            <RoundIcon src="/images/rightarrow-icon.png"  width="100%" height="100%"/>
          ) : (
            <RoundIcon src="/images/leftarrow-icon.png"  width="100%" height="100%"/>
          )}
        </button>
        <button
          onClick={handleHome}
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/home-icon.png"  width="100%" height="100%"/>
        </button>
        <button
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/groups-icon.png"  width="100%" height="100%" />
        </button>
        <button
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/foundations-icon.png" width="100%" height="100%" />
        </button>
        <button
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/notifications-icon.png"  width="100%" height="100%"/>
        </button>
        <button
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/settings-icon.png"  width="100%" height="100%"/>
        </button>
        <hr
          className={`border-t my-2 w-${
            isSidebarExpanded ? 32 : 8
          } border-citron`}
        />
        <button
          onClick={handleLogOut}
          className={`w-7 h-7 rounded-full bg-white mt-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/logout-icon.png"  width="100%" height="100%"/>
        </button>
      </div>
    </nav>
  );
}
