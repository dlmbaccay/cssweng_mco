import React, { useState } from 'react';
import Image from 'next/image';
import Router from 'next/router';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function AdminNavbar({ props }) {
    
    const { expanded, activeContainer, setActiveContainer } = props;
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
            className='pt-10 pb-10 w-[300px] h-screen justify-between bg-pale_yellow drop-shadow-xl flex flex-col'>
            
            <div className='flex flex-col items-center justify-center'>
                <Image 
                src={'/images/logo.png'}
                alt='logo'
                width={125} 
                height={125}
                className='rounded-full'
                />
                <h1 className='font-shining text-4xl text-grass'>Admin</h1>
            </div>

            <div className='flex flex-col gap-4'>
                <button 
                onClick={() => setActiveContainer('Reported Posts')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
                <i 
                    className={`
                    text-md w-[35px] h-[35px]
                    flex items-center justify-center
                    fa-solid fa-flag rounded-full 
                    bg-grass text-pale_yellow 
                    transition-all group-hover:bg-raisin_black 
                    ${activeContainer === 'Reported Posts' ? "bg-raisin_black" : ""}
                    `}/>
                <p className={`
                    text-grass text-2xl
                    font-shining 
                    transition-all  group-hover:text-raisin_black 
                    ${activeContainer === 'Reported Posts' ? "text-raisin_black" : ""}`}>
                    Reported Posts</p>
                </button>

                <button 
                onClick={() => setActiveContainer('Foundation Applications')} className='group flex flex-row items-center gap-2 pl-10 h-10'>
                <i 
                    className={`
                    text-md w-[35px] h-[35px]
                    flex items-center justify-center
                    fa-solid fa-earth-asia rounded-full 
                    bg-grass text-pale_yellow 
                    transition-all group-hover:bg-raisin_black 
                    ${activeContainer === 'Foundation Applications' ? "bg-raisin_black" : ""}
                    `}/>
                <p className={`
                    text-grass text-2xl
                    font-shining  
                    transition-all  group-hover:text-raisin_black 
                    ${activeContainer === 'Foundation Applications' ? "text-raisin_black" : ""}`}>
                    Foundations</p>
                </button>

                <hr className='border border-xanthous opacity-30 ml-6 mr-6 mt-2 mb-2'/>

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
            </div>
            
            
          </div>
        }
        
    </>
  )
}
