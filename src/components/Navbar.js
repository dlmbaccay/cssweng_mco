import React, { useState } from "react";
import RoundIcon from "./RoundIcon";

const Navbar = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <nav
      className={`sticky left-0 top-0 z-10 bg-pale_yellow text-white w-16 h-screen flex flex-col items-center transition-all ${
        isSidebarExpanded ? "w-48" : "w-16"
      }`}
    >
      {/* Circular profile picture (always visible) */}
      <div className="w-10 h-10 rounded-full bg-white mt-8">
        <RoundIcon src="/images/user0-image.png" />
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
            <RoundIcon src="/images/rightarrow-icon.png" />
          ) : (
            <RoundIcon src="/images/leftarrow-icon.png" />
          )}
        </button>
        <button
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/home-icon.png" />
        </button>
        <button
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/groups-icon.png" />
        </button>
        <button
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/foundations-icon.png" />
        </button>
        <button
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/notifications-icon.png" />
        </button>
        <button
          className={`w-7 h-7 rounded-full bg-white mb-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/settings-icon.png" />
        </button>
        <hr
          className={`border-t my-2 w-${
            isSidebarExpanded ? 32 : 8
          } border-citron`}
        />
        <button
          className={`w-7 h-7 rounded-full bg-white mt-4 text-black ${
            isSidebarExpanded ? "w-10 h-10" : ""
          }`}
        >
          <RoundIcon src="/images/logout-icon.png" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
