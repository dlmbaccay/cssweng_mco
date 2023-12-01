import React, { useEffect, useState } from 'react'
import { auth, firestore } from '../lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, where } from 'firebase/firestore';
import { useUserData } from '../lib/hooks';
import withAuth from '../components/withAuth';

import Router from 'next/router';
import Modal from 'react-modal';
import Image from 'next/image';

import CreatePost from '../components/Post/CreatePost';
import PostSnippet from '../components/Post/PostSnippet';
import Repost from '../components/Post/RepostSnippet';
import ExpandedNavBar from '../components/ExpandedNavBar';
import PhoneNav from '../components/PhoneNav';
import { createPostModalStyle, phoneNavModalStyle } from '../lib/modalstyle';
import toast from 'react-hot-toast'

function Foundations() {

  useEffect(() => {
    if (document.getElementById('root')) {
      Modal.setAppElement('#root');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) setPageLoading(false);
      else setPageLoading(true);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const { user, username, description, email, displayName, userPhotoURL, notifications } = useUserData();

  const router = Router;
  const [ pageLoading, setPageLoading ] = useState(true);
  const [ isSearchInputFocused, setIsSearchInputFocused ] = useState(false);


  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setPageLoading(true);

}, []); // Ensure this effect only runs once on component mount

  const [showPhoneNavModal, setShowPhoneNavModal] = useState(false);

  if (!pageLoading) {
    return (
      <div className='flex flex-row w-full h-screen overflow-hidden'>
        <div className='hidden lg:flex lg:w-[300px]'>
          {(userPhotoURL && username) && <ExpandedNavBar 
              props={{
                userPhotoURL: userPhotoURL,
                username: username,
                activePage: "Foundations",
                expanded: true,
                notifications: notifications
              }}
          />}
        </div>

        <div className='w-fit md:flex lg:hidden hidden'>
          {(userPhotoURL && username) && <ExpandedNavBar 
              props={{
                userPhotoURL: userPhotoURL,
                username: username,
                activePage: "Foundations",
                expanded: false,
                notifications: notifications
              }}
          />}
        </div>

        <div className='w-full bg-dark_gray'>            

          <nav className='w-full h-14 bg-snow flex justify-between items-center md:hidden drop-shadow-sm'>
              <div className='h-full w-fit flex flex-row items-center gap-1'>
                <Image src='/images/logo.png' alt='logo' width={40} height={40} className='ml-2 rounded-full'/>
                <h1 className='font-shining text-4xl text-grass'>BantayBuddy</h1>
              </div>
              
              <button onClick={() => setShowPhoneNavModal(true)}>
                <i className='fa-solid fa-bars text-xl w-[56px] h-[56px] flex items-center justify-center'/>
              </button>

              <Modal 
                  isOpen={showPhoneNavModal}
                  onRequestClose={() => setShowPhoneNavModal(false)}
                  style={phoneNavModalStyle}
              >
                <PhoneNav 
                  props = {{
                    setShowPhoneNavModal: setShowPhoneNavModal,
                    currentUserUsername: username,
                    currentUserPhotoURL: userPhotoURL,
                  }}
                />
              </Modal>
          </nav>

          {/* search and logo bar */}
          <div className='w-full bg-snow drop-shadow-lg h-14 md:flex flex-row justify-between hidden'>
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
                  <h1 className='font-shining text-3xl text-grass'>BantayBuddy</h1>

                  <div className='bg-grass w-[40px] h-[40px] rounded-full shadow-lg'>
                  <Image src='/images/logo.png' alt='logo' width={100} height={100} className='rounded-full'/>
                  </div>
              </div>
          </div>  

          {/* main container */}
          <div className='h-full w-full overflow-y-scroll'>

           
           <button className='font-shining text-2xl bg-grass text-snow px-4 py-2 rounded-lg hover:bg-black transition-all m-5'>
            Feature your Foundation!
           </button>

          </div>
        </div>
      </div>   
    )
  } else return null;
}


export default withAuth(Foundations);