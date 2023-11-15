import React, { useEffect, useState } from 'react'
import { useCurrentUserPets, useUserData, useAllPosts } from '../lib/hooks';
import { auth, firestore, googleAuthProvider } from '../lib/firebase'
import { useAllUsersAndPets } from '../lib/hooks';
import Router from 'next/router';
import PostSnippet from '../components/PostSnippet';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import NavBar from '../components/NavBar';
import Link from 'next/link';
import withAuth from '../components/withAuth';
import Image from 'next/image';
import Loader from '../components/Loader';
import CreatePost from '../components/CreatePost';
import RoundIcon from '../components/RoundIcon';
import { createPostModalStyle } from '../lib/modalstyle';
import ExpandedNavBar from '../components/ExpandedNavBar';

import Newsfeed from '../components/Menu/Newsfeed';
import PetTracker from '../components/Menu/PetTracker';
import Messages from '../components/Menu/Messages';
import SavedPosts from '../components/Menu/SavedPosts';
import Shops from '../components/Menu/Shops';


function Home() {

  useEffect(() => {
    if (document.getElementById('root')) {
      Modal.setAppElement('#root');
    }
  }, []);

  const { user, username, description, email, displayName, userPhotoURL } = useUserData();
  
  const router = Router;

  const [ pageLoading, setPageLoading ] = useState(true);

  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          // User is signed in.
          setPageLoading(false);
        } else {
          // No user is signed in.
          setPageLoading(true);
        }
      });
  
      // Cleanup subscription on unmount
      return () => unsubscribe();
  }, []);

  // create post variables
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);

  // menu container control
  const [activeContainer, setActiveContainer] = useState('Newsfeed');

  if (!pageLoading) {
    return (
      <div className='flex flex-row w-full h-screen overflow-hidden'>

        <div className='w-1/6'>
          {(userPhotoURL && username) && <ExpandedNavBar 
            props={{
              userPhotoURL: userPhotoURL,
              username: username,
              activePage: "Home"
            }}
        />}
        </div>

        {/* middle */}
        <div className='w-4/6 bg-gray'>
            
          {/* search and logo bar */}
          <div className='w-full bg-snow drop-shadow-lg h-14 flex flex-row justify-between'>
              
            <div className='group flex flex-row w-[400px] items-center justify-center h-full ml-8'>
              <i
                className={`fa-solid fa-search w-[40px] h-8 text-raisin_black text-sm flex justify-center items-center rounded-l-full transition-all cursor-pointer group-hover:bg-white ${isSearchInputFocused ? 'bg-white' : 'bg-gray'}`}
                // onClick={}
              />
              <input 
                type='text'
                placeholder='Search'
                className={`w-full h-8 pr-4 outline-none rounded-r-full transition-all group-hover:bg-white text-sm ${isSearchInputFocused ? 'bg-white' : 'bg-gray'}`}
                onFocus={() => setIsSearchInputFocused(true)}
                onBlur={() => setIsSearchInputFocused(false)}
              />
            </div>

            <div className='flex flex-row justify-center items-center gap-2 mr-8'>
              <h1 className='font-bold font-shining text-3xl text-grass'>BantayBuddy</h1>

              <div className='bg-grass w-[40px] h-[40px] rounded-full'>
                <Image src='/images/logo.png' alt='logo' width={100} height={100} className='rounded-full'/>
              </div>
            </div>
          </div>  

          {/* main container */}
          <div className='h-full w-full overflow-y-scroll'>

              { activeContainer === 'Newsfeed' && 
                <Newsfeed 
                  props={{
                    user: user,
                    username: username,
                    description: description,
                    email: email,
                    displayName: displayName,
                    userPhotoURL: userPhotoURL,
                    showCreatePostForm: showCreatePostForm,
                    setShowCreatePostForm: setShowCreatePostForm,
                  }}
                /> 
              }

              { activeContainer === 'Pet Tracker' && 
                <PetTracker 
                  props={{
                    user: user,
                    username: username,
                    description: description,
                    email: email,
                    displayName: displayName,
                    userPhotoURL: userPhotoURL,
                    showCreatePostForm: showCreatePostForm,
                    setShowCreatePostForm: setShowCreatePostForm,
                  }}
                />
              }
              
              { activeContainer === 'Messages' && <Messages /> }
              { activeContainer === 'Saved Posts' && <SavedPosts /> }
              { activeContainer === 'Shops' && <Shops /> }
          </div>
        </div>

        {/* right navbar */}
        <div className='w-1/6 bg-snow drop-shadow-xl h-screen p-10 flex flex-col'>
          {/* menu */}
          <div className='flex flex-col gap-4 mt-6 mb-6'>
            <h1 className='font-bold font-shining text-mustard text-4xl mb-2'>Menu</h1>

            <button
              onClick={() => {
                setActiveContainer('Newsfeed');
              }}
              className='group flex flex-row items-center gap-2'>
              <i className={`fa-solid fa-newspaper w-[40px] h-[40px] rounded-full bg-grass flex items-center justify-center text-xl text-snow group-hover:bg-raisin_black ${activeContainer === "Newsfeed" ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass font-shining text-xl group-hover:text-raisin_black ${activeContainer === "Newsfeed" ? "text-raisin_black" : ""}`}>Newsfeed</p>
           </button>


            <button
              onClick={() => {
                setActiveContainer('Pet Tracker');
              }}
              className='group flex flex-row items-center gap-2'>
              <i className={`fa-solid fa-paw w-[40px] h-[40px] rounded-full bg-grass flex items-center justify-center text-xl text-snow group-hover:bg-raisin_black ${activeContainer === "Pet Tracker" ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass font-shining text-xl group-hover:text-raisin_black ${activeContainer === "Pet Tracker" ? "text-raisin_black" : ""}`}>Pet Tracker</p>
           </button>
            
            <button 
              onClick={() => {
                setActiveContainer('Messages');
              }}
              className='group flex flex-row items-center gap-2'>
              <i className={`fa-solid fa-envelope w-[40px] h-[40px] rounded-full bg-grass flex items-center justify-center text-xl text-snow group-hover:bg-raisin_black ${activeContainer === "Messages" ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass font-shining text-xl group-hover:text-raisin_black ${activeContainer === "Messages" ? "text-raisin_black" : ""}`}>Messages</p>
            </button>

            <button 
              onClick={() => {
                setActiveContainer('Saved Posts');
              }}
              className='group flex flex-row items-center gap-2'>
              <i className={`fa-solid fa-bookmark w-[40px] h-[40px] rounded-full bg-grass flex items-center justify-center text-xl text-snow group-hover:bg-raisin_black ${activeContainer === "Saved Posts" ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass font-shining text-xl group-hover:text-raisin_black ${activeContainer === "Saved Posts" ? "text-raisin_black" : ""}`}>Saved Posts</p>
            </button>

            <button 
              onClick={() => {
                setActiveContainer('Shops');
              }}
              className='group flex flex-row items-center gap-2'>
              <i className={`fa-solid fa-cart-shopping w-[40px] h-[40px] rounded-full bg-grass flex items-center justify-center text-xl text-snow group-hover:bg-raisin_black ${activeContainer === "Shops" ? "bg-raisin_black" : ""}`}></i>
              <p className={`text-grass font-shining text-xl group-hover:text-raisin_black ${activeContainer === "Shops" ? "text-raisin_black" : ""}`}>Shops</p>
            </button>
          </div>

          <hr className='text-dark_gray'/>

          {/* events */}
          <div className='flex flex-col mt-6'>
            <h1 className='font-bold font-shining text-mustard text-4xl mb-2'>Events</h1>

            {/* events to be added here */}
          </div>
        </div>  

      </div>   
    )
  } else {
    return null;
  }
}

export default withAuth(Home);