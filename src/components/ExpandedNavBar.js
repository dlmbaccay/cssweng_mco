import React, { useState } from 'react';
import Image from 'next/image';
import Router from 'next/router';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';
import Notifications from './Notifications';
import Modal from 'react-modal';

export default function ExpandedNavBar({ props }) {
    
    const { userPhotoURL, username, activePage, expanded, isUser, notifications, lostPetPostsCount } = props;
    const router = Router;
    const [showNotifications, setShowNotifications] = useState(false);


    const [isExpanded, setIsExpanded] = useState(expanded);

    const handleMouseEnter = () => {
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        if (!expanded && !showNotifications) {
            setIsExpanded(false);
        }
    };
    console.log(notifications)

    const handleToggleNotifications = () => {
      setShowNotifications(!showNotifications);
    };


    return (
        <>
          <div 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`${ isExpanded ? 'relative w-[330px] h-screen bg-pale_yellow drop-shadow-xl flex flex-col p-10 transition-all duration-300 ease-in' : 'w-14 pl-1 pr-1 pt-2 pb-4 h-screen bg-pale_yellow drop-shadow-xl flex flex-col justify-between items-center transition-all duration-150 ease-out'}`}>

            { !isExpanded ?
              <>
                <Image 
                  src={'/images/logo.png'}
                  alt='logo'
                  width={100} 
                  height={100}
                  className='rounded-full'
                />

                <i className='fa-solid fa-bars text-xl text-grass'/>
              </>
              :
              <>
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
                  onClick={() => router.push('/Home')} className='group flex flex-row items-center gap-2 pl-6 h-10'>
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
                  onClick={() => router.push('/PetTracker')} className='group flex flex-row items-center gap-2 pl-6 h-10'>
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
                      Pet</p>
                  <p className={`
                    text-grass text-2xl
                    font-shining 
                    transition-all  group-hover:text-raisin_black 
                    ${activePage === 'PetTracker' ? "text-raisin_black" : ""}`}>
                      Tracker</p>


                  <div
                    className={`
                      w-6 h-6 flex items-center justify-center
                      bg-mustard rounded-full overflow-hidden
                      ${activePage === 'PetTracker' ? "border-2 border-raisin_black" : ""}
                    `}
                  >
                    <p className={`
                      text-snow text-xl font-shining 
                      transition-all group-hover:text-raisin_black 
                      ${activePage === 'PetTracker' ? "text-raisin_black" : ""}
                    `}>
                      {lostPetPostsCount === undefined ? 0 : lostPetPostsCount}
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push(`/user/${username}`)} className='group flex flex-row items-center gap-2 pl-6 h-10'>
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
                  onClick={() => setShowNotifications(!showNotifications)} className='group flex flex-row items-center gap-2 pl-6 h-10'>
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
                  <div
                    className={`
                      w-6 h-6 flex items-center justify-center
                      bg-xanthous rounded-full overflow-hidden
                      ${activePage === 'Notifications' ? "border-2 border-raisin_black" : ""}
                    `}
                  >
                    <p className={`
                      text-snow text-xl font-shining 
                      transition-all group-hover:text-raisin_black 
                      ${activePage === 'Notifications' ? "text-raisin_black" : ""}
                    `}>
                      {notifications === undefined ? 0 : notifications.length}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/Settings')} className='group flex flex-row items-center gap-2 pl-6 h-10'>
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
                className='group flex flex-row items-center gap-2 pl-6 h-10'
                >
                <i className='transition-all fa-solid fa-right-from-bracket pl-[2px] w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-lg text-pale_yellow group-hover:bg-raisin_black'></i>
                <p className='transition-all text-grass text-2xl font-shining group-hover:text-raisin_black'>Log </p>
                <p className='transition-all text-grass text-2xl font-shining group-hover:text-raisin_black'>Out</p>
              </button>
              </>
            }
            
            </div>
            
            <div className={`absolute top-0 left-[330px] w-[350px] h-screen z-20 ${!showNotifications ? 'hidden transition-all ease-out duration-300':'transition-all ease-in duration-300'}`}>
              <Notifications notifications={notifications}  toggleNotifs={handleToggleNotifications}/>
            </div>
            
        
    </>
  )
}
