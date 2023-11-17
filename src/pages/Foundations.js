import React, { useEffect, useState } from 'react'
import { auth, firestore } from '../lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs } from 'firebase/firestore';
import { useUserData } from '../lib/hooks';
import withAuth from '../components/withAuth';

import Router from 'next/router';
import Modal from 'react-modal';
import Image from 'next/image';

import CreatePost from '../components/CreatePost';
import ExpandedNavBar from '../components/ExpandedNavBar';
import { createPostModalStyle } from '../lib/modalstyle';

export default function Foundations() {

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) setPageLoading(false);
        else setPageLoading(true);
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    const { user, username, description, email, displayName, userPhotoURL } = useUserData();
    const [ pageLoading, setPageLoading ] = useState(true);
    const [ isSearchInputFocused, setIsSearchInputFocused ] = useState(false);

    if (!pageLoading) {
        return (
            <div className='flex flex-row w-full h-screen overflow-hidden'>
                <div className='w-[20%]'>
                    {(userPhotoURL && username) && <ExpandedNavBar 
                        props={{
                            userPhotoURL: userPhotoURL,
                            username: username,
                            activePage: "Foundations"
                        }}
                    />}
                </div>

                <div className='w-full bg-dark_gray'>            
                    {/* search and logo bar */}
                    <div className='w-full bg-snow drop-shadow-lg h-14 flex flex-row justify-between'>
                        
                    <div className='group flex flex-row w-[400px] items-center justify-center h-full ml-8 drop-shadow-sm'>
                        <i
                        className={`fa-solid fa-search w-[40px] h-8 text-sm font-bold flex justify-center items-center rounded-l-lg transition-all cursor-pointer group-hover:bg-grass group-hover:text-pale_yellow ${isSearchInputFocused ? 'bg-grass text-pale_yellow' : 'bg-dark_gray'}`}
                        // onClick={}
                        />
                        <input 
                        type='text'
                        placeholder='Search'
                        className={`w-full h-8 pl-2 pr-4 outline-none rounded-r-lg bg-dark_gray transition-all text-sm group-hover:bg-white ${isSearchInputFocused ? 'bg-white' : 'bg_dark_gray'}`}
                        onFocus={() => setIsSearchInputFocused(true)}
                        onBlur={() => setIsSearchInputFocused(false)}
                        />
                    </div>

                    <div className='flex flex-row justify-center items-center gap-2 mr-8'>
                        <h1 className='font-bold font-shining text-3xl text-grass'>BantayBuddy</h1>

                        <div className='bg-grass w-[40px] h-[40px] rounded-full shadow-lg'>
                        <Image src='/images/logo.png' alt='logo' width={100} height={100} className='rounded-full'/>
                        </div>
                    </div>
                    </div>  

                    {/* main container */}
                    <div className='h-full w-full overflow-y-scroll'>
                        <div className='h-[90%] flex flex-col justify-center items-center'>
                            <i className="fa-solid fa-hippo text-8xl text-grass"></i>
                            <div className='mt-2 font-bold text-grass'>Nothing to see here yet...</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else return null;
}
