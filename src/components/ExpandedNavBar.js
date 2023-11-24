import React, { useState } from 'react';
import Image from 'next/image';
import Router from 'next/router';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function ExpandedNavBar({ props }) {
    
    const { userPhotoURL, username, activePage, expanded, isUser } = props;
    const router = Router;


    const [isExpanded, setIsExpanded] = useState(expanded);

    const handleMouseEnter = () => {
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        if (!expanded) {
            setIsExpanded(false);
        }
    };

    return (
    <>
        { !isExpanded && 
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className='w-14 pl-1 pr-1 pt-2 pb-4 h-screen bg-pale_yellow drop-shadow-xl flex flex-col justify-between items-center'
          >
            <Image 
              src={'/images/logo.png'}
              alt='logo'
              width={100} 
              height={100}
              className='rounded-full'
            />

            <i className='fa-solid fa-bars text-xl text-grass'/>
          </div>          
        }

        {
          (isExpanded) && 
          <div 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className='w-[300px] h-screen bg-pale_yellow drop-shadow-xl flex flex-col'>
            
            {/* user meta */}
            <button 
              onClick={() => {router.push(`/user/${username}`)}}
              className='group flex flex-col justify-center items-center mt-10 gap-4'>
                  {<Image src={userPhotoURL} alt={'profile picture'} width={100} height={100} className='rounded-full group-hover:scale-105 transition-all aspect-square object-cover'/>}
                <p className='text-raisin_black text-2xl font-shining group-hover:scale-105 group-hover:text-grass transition-all'>@{username} </p>
            </button>

            <hr className='border border-xanthous opacity-30 ml-6 mr-6 mt-6 mb-6'/>

            <div className='flex flex-col gap-4'>
              <button 
                onClick={() => router.push('/Home')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
                <i 
                  className={`
                  text-md w-[35px] h-[35px]
                  flex items-center justify-center
                  fa-solid fa-home rounded-full 
                  bg-grass text-pale_yellow 
                  transition-all group-hover:bg-raisin_black 
                  ${activePage === 'Home' ? "bg-raisin_black" : ""}
                  `}/>
                <p className={`
                text-grass text-2xl
                  font-shining  
                  transition-all  group-hover:text-raisin_black 
                  ${activePage === 'Home' ? "text-raisin_black" : ""}`}>
                    Home</p>
              </button>

              <button 
                onClick={() => router.push('/PetTracker')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
                <i 
                  className={`
                  text-md w-[35px] h-[35px]
                  flex items-center justify-center
                  fa-solid fa-paw rounded-full 
                  bg-grass text-pale_yellow 
                  transition-all group-hover:bg-raisin_black 
                  ${activePage === 'PetTracker' ? "bg-raisin_black" : ""}
                  `}/>
                <p className={`
                  text-grass text-2xl
                  font-shining 
                  transition-all  group-hover:text-raisin_black 
                  ${activePage === 'PetTracker' ? "text-raisin_black" : ""}`}>
                    Pet Tracker</p>
              </button>

              <button 
                onClick={() => router.push('/Home')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
                <i 
                  className={`
                  text-md w-[35px] h-[35px]
                  flex items-center justify-center
                  fa-solid fa-earth-asia rounded-full 
                  bg-grass text-pale_yellow 
                  transition-all group-hover:bg-raisin_black 
                  ${activePage === 'Foundations' ? "bg-raisin_black" : ""}
                  `}/>
                <p className={`
                  text-grass text-2xl
                  font-shining  
                  transition-all  group-hover:text-raisin_black 
                  ${activePage === 'Foundations' ? "text-raisin_black" : ""}`}>
                    Foundations</p>
              </button>

              <button 
                onClick={() => router.push(`/user/${username}`)} className='group flex flex-row items-center gap-2 pl-10 h-10'>
                <i 
                  className={`
                  text-md w-[35px] h-[35px]
                  flex items-center justify-center
                  fa-solid fa-user rounded-full 
                  bg-grass text-pale_yellow 
                  transition-all group-hover:bg-raisin_black 
                  ${(activePage && isUser)  === 'Profile' ? "bg-raisin_black" : ""}
                  `}/>
                <p className={`
                  text-grass text-2xl
                  font-shining  
                  transition-all  group-hover:text-raisin_black 
                  ${(activePage && isUser) === 'Profile' ? "text-raisin_black" : ""}`}>
                    Profile</p>
              </button>

              <button 
                onClick={() => router.push('/Home')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
                <i 
                  className={`
                  text-md w-[35px] h-[35px]
                  flex items-center justify-center
                  fa-solid fa-bell rounded-full 
                  bg-grass text-pale_yellow 
                  transition-all group-hover:bg-raisin_black 
                  ${activePage === 'Notifications' ? "bg-raisin_black" : ""}
                  `}/>
                <p className={`
                  text-grass text-2xl
                  font-shining  
                  transition-all  group-hover:text-raisin_black 
                  ${activePage === 'Notifications' ? "text-raisin_black" : ""}`}>
                    Notifications</p>
              </button>

              <button
                onClick={() => router.push('/Settings')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
                <i 
                  className={`
                  text-md w-[35px] h-[35px]
                  flex items-center justify-center
                  fa-solid fa-gear rounded-full 
                  bg-grass text-pale_yellow 
                  transition-all group-hover:bg-raisin_black 
                  ${activePage === 'Settings' ? "bg-raisin_black" : ""}
                  `}/>
                <p className={`
                  text-grass text-2xl
                  font-shining 
                  transition-all  group-hover:text-raisin_black 
                  ${activePage === 'Settings' ? "text-raisin_black" : ""}`}>
                    Settings</p>
              </button>
            </div>

            <hr className='border border-xanthous opacity-30 ml-6 mr-6 mt-6 mb-6'/>

            <button 
              onClick={() => {
                auth.signOut();
                router.push('/');
                toast.success('Successfully logged out!');
              }} 
              className='group flex flex-row items-center gap-2 pl-10 h-10'
              >
              <i className='transition-all fa-solid fa-right-from-bracket pl-[2px] w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-lg text-pale_yellow group-hover:bg-raisin_black'></i>
              <p className='transition-all text-grass text-2xl font-shining group-hover:text-raisin_black'>Log Out</p>
            </button>
{/* 
            <button onClick={() => router.push('/AboutUs')} className='text-xanthous mb-2 mt-auto hover:text-grass'>
              About Us
            </button> */}
          </div>
        }
        
    </>
  )
}
