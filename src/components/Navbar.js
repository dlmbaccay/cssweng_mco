import React from 'react';

const Navbar = () => {
    return (
      <nav className="bg-pale_yellow text-white w-16 h-screen flex flex-col items-center">
        
        {/* Circular profile picture */}
        <div className="w-10 h-10 rounded-full bg-white mt-8"></div>

        {/* Circular buttons */}
        <div className="flex flex-col items-center mt-auto mb-10">
          <button className="w-7 h-7 rounded-full bg-white mb-4 text-black">H</button>
          <button className="w-7 h-7 rounded-full bg-white mb-4 text-black">G</button>
          <button className="w-7 h-7 rounded-full bg-white mb-4 text-black">F</button>
          <button className="w-7 h-7 rounded-full bg-white mb-4 text-black">N</button>
          <button className="w-7 h-7 rounded-full bg-white mb-4 text-black">S</button>
          <hr className="border-t my-2 w-8 border-citron" />
          <button className="w-7 h-7 rounded-full bg-white mt-4 text-black">L</button>
        </div>
        
      </nav>
    );
  };
  
  export default Navbar;