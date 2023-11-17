import React from 'react'
import Image from 'next/image';
import Router from 'next/router';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function ExpandedNavBar({ props }) {
    
    const { userPhotoURL, username, activePage } = props;
    const router = Router;

    return (
    <>
        {/* home navbar */}
        <div className='w-full h-screen bg-pale_yellow drop-shadow-xl flex flex-col'>
          
          {/* user meta */}
          <button 
            onClick={() => {router.push(`/user/${username}`)}}
            className='group flex flex-col justify-center items-center mt-10 gap-4'>
              {<Image src={userPhotoURL} alt={'profile picture'} width={100} height={100} className='rounded-full group-hover:scale-105 transition-all'/>}
              <p className='text-raisin_black text-xl font-shining font-semibold group-hover:scale-105 group-hover:text-grass transition-all'>{username} </p>
          </button>

          <hr className='border border-xanthous opacity-30 ml-6 mr-6 mt-6 mb-6'/>

          <div className='flex flex-col gap-4'>

            <button onClick={() => router.push('/Home')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
              <i className={`transition-all fa-solid fa-home w-[30px] h-[30px] rounded-full bg-grass flex items-center justify-center text-md text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Home' ? "bg-raisin_black" : ""}`}></i>
              <p className={`transition-all text-grass text-xl font-shining font-semibold group-hover:text-raisin_black ${activePage === 'Home' ? "text-raisin_black" : ""}`}>Home</p>
            </button>

            <button onClick={() => router.push('/Home')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
              <i className={`transition-all fa-solid fa-paw w-[30px] h-[30px] rounded-full bg-grass flex items-center justify-center text-lg text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Pet Tracker' ? "bg-raisin_black" : ""}`}></i>
              <p className={`transition-all text-grass text-xl font-shining font-semibold group-hover:text-raisin_black ${activePage === 'Pet Tracker' ? "text-raisin_black" : ""}`}>Pet Tracker</p>
            </button>

            <button onClick={() => router.push('/Home')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
              <i className={`transition-all fa-solid fa-earth-asia w-[30px] h-[30px] rounded-full bg-grass flex items-center justify-center text-xl text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Foundations' ? "bg-raisin_black" : ""}`}></i>
              <p className={`transition-all text-grass text-xl font-shining font-semibold group-hover:text-raisin_black ${activePage === 'Foundations' ? "text-raisin_black" : ""}`}>Foundations</p>
            </button>

            <button onClick={() => router.push(`/user/${username}`)} className='group flex flex-row items-center gap-2 pl-10 h-10'>
              <i className={`transition-all fa-solid fa-user w-[30px] h-[30px] rounded-full bg-grass flex items-center justify-center text-md text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Foundations' ? "bg-raisin_black" : ""}`}></i>
              <p className={`transition-all text-grass text-xl font-shining font-semibold group-hover:text-raisin_black ${activePage === 'Profile' ? "text-raisin_black" : ""}`}>Profile</p>
            </button>

            <button onClick={() => router.push('/Home')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
              <i className={`transition-all fa-solid fa-bell w-[30px] h-[30px] rounded-full bg-grass flex items-center justify-center text-lg text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Notifications' ? "bg-raisin_black" : ""}`}></i>
              <p className={`transition-all text-grass text-xl font-shining font-semibold group-hover:text-raisin_black ${activePage === 'Notifications' ? "text-raisin_black" : ""}`}>Notifications</p>
            </button>

            <button onClick={() => router.push(`/Settings`)} className='group flex flex-row items-center gap-2 pl-10 h-10'>
              <i className={`transition-all fa-solid fa-gear w-[30px] h-[30px] rounded-full bg-grass flex items-center justify-center text-lg text-pale_yellow group-hover:bg-raisin_black ${activePage === 'Settings' ? "bg-raisin_black" : ""}`}></i>
              <p className={`transition-all text-grass text-xl font-shining font-semibold group-hover:text-raisin_black ${activePage === 'Settings' ? "text-raisin_black" : ""}`}>Settings</p>
            </button>
          </div>

          <hr className='border border-xanthous opacity-30 ml-6 mr-6 mt-6 mb-6'/>

          <button 
            onClick={() => {
              auth.signOut();
              toast.success('Successfully logged out!');
            }} 
            className='group flex flex-row items-center gap-2 pl-10 h-10'
            >
            <i className='transition-all fa-solid fa-right-from-bracket pl-[2px] w-[30px] h-[30px] rounded-full bg-grass flex items-center justify-center text-lg text-pale_yellow group-hover:bg-raisin_black'></i>
            <p className='transition-all text-grass text-xl font-shining font-semibold group-hover:text-raisin_black'>Log Out</p>
          </button>
        </div>
    </>
  )
}
