import React, { useEffect, useState } from 'react'
import { useCurrentUserPets, useUserData } from '../lib/hooks';
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


function Home() {

  useEffect(() => {
    if (document.getElementById('root')) {
      Modal.setAppElement('#root');
    }
  }, []);

  const { user, username, description, email, displayName, userPhotoURL } = useUserData();
  const router = Router;

  const [ userPets, setUserPets ] = useState([]);

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

  // fetch all pets of the profile user
  useEffect(() => {
    let unsubscribe;

    if (user) {
        const petsCollectionRef = firestore.collection('pets').where("petOwnerID", "==", user.uid);
        petsCollectionRef.get().then((querySnapshot) => {
            const petsData = [];
            querySnapshot.forEach((doc) => {
                petsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setUserPets(petsData);
        });
    } else {
        setUserPets([]);
    }

    return unsubscribe;
  }, [user]);

  // fetch all posts

  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    let unsubscribe;

    if (user) {
        const postsCollectionRef = firestore.collection('posts');
        postsCollectionRef.get().then((querySnapshot) => {
            const postData = [];
            querySnapshot.forEach((doc) => {
                postData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setAllPosts(postData);
        });
    }

    return unsubscribe;
  });

  // create post variables
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);

  if (!pageLoading) {
    return (
      <div className='flex flex-row w-full h-screen overflow-hidden'>

        {/* home navbar */}
        <div className='w-1/6 bg-pale_yellow drop-shadow-xl flex flex-col'>
          {/* user meta */}
          <div className='flex flex-col justify-center items-center gap-2 mt-10 mb-8'>
              {userPhotoURL && <Image src={userPhotoURL} alt={'profile picture'} width={100} height={100} className='rounded-full'/>}

              {username && <h1 className='text-md font-bold text-raisin_black mt-2'>{username}</h1>}

              <div>
                <button className='bg-grass rounded-lg px-4 py-1 text-sm text-pale_yellow font-bold hover:bg-raisin_black transition-all mt-2' onClick={() => router.push(`/user/${username}`)}>View Profile</button>
              </div>
          </div>

          <hr className='border border-xanthous opacity-50 ml-6 mr-6'/>

          {/* Home, Groups, Foundations, Notifications, Settings */}
          <div className='flex flex-col mt-6 mb-4'>
            <button 
                onClick={() => {
                    router.push(`/Home`);
                }} 
                className='group flex flex-row items-center gap-2 pl-10 h-16'>
              <i className='fa-solid fa-home w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-lg text-pale_yellow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-md font-semibold group-hover:text-raisin_black'>Home</p>
           </button>

            <button className='group flex flex-row items-center gap-2 pl-10 h-16 '>
              <i className='fa-solid fa-user-group w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-md text-pale_yellow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-md font-semibold group-hover:text-raisin_black'>Groups</p>
            </button>

            <button className='group flex flex-row items-center gap-2 pl-10 h-16 '>
              <i className='fa-solid fa-earth-asia w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-xl text-pale_yellow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-md font-semibold group-hover:text-raisin_black'>Foundations</p>
            </button>

            <button className='group flex flex-row items-center gap-2 pl-10 h-16 '>
              <i className='fa-solid fa-bell w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-xl text-pale_yellow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-md font-semibold group-hover:text-raisin_black'>Notifications</p>
            </button>

            <button 
              onClick={() => {
                router.push(`/Settings`);
              }}
              className='group flex flex-row items-center gap-2 pl-10 h-16 '
            >
              <i className='fa-solid fa-gear w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-xl text-pale_yellow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-md font-semibold group-hover:text-raisin_black'>Settings</p>
            </button>
          </div>

          <hr className='border border-xanthous opacity-50 ml-6 mr-6'/>

          <div className='mt-4'>
            <button 
              onClick={() => {
                auth.signOut();
                toast.success('Successfully logged out!');
              }} 
              className='group flex flex-row items-center gap-2 pl-10 h-16'
              >
              <i className='fa-solid fa-door-open w-[35px] h-[35px] rounded-full bg-grass flex items-center justify-center text-lg text-pale_yellow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-md font-semibold group-hover:text-raisin_black'>Log Out</p>
           </button>
          </div>
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
                className={`w-full h-8 pr-4 outline-none rounded-r-full transition-all group-hover:bg-white text-md ${isSearchInputFocused ? 'bg-white' : 'bg-gray'}`}
                onFocus={() => setIsSearchInputFocused(true)}
                onBlur={() => setIsSearchInputFocused(false)}
              />
            </div>

            <div className='flex flex-row justify-center items-center gap-4 mr-8'>
              <h1 className='font-bold text-lg'>BantayBuddy</h1>

              <div className='bg-grass w-[40px] h-[40px] rounded-full'></div>
            </div>
          </div>  

          {/* main container */}
          <div className='h-full w-full overflow-y-scroll flex flex-col justify-start items-center pt-8 pb-8'>

            {/* create post */}
            <div className='flex flex-row w-[800px] min-h-[100px] bg-snow drop-shadow-lg rounded-lg items-center justify-evenly'>
                <Image src={userPhotoURL} alt={'profile picture'} width={50} height={50} className='h-[60px] w-[60px] rounded-full'/>
                <button
                  className='bg-dark_gray h-[60px] w-[85%] text-sm rounded-xl flex pl-4 items-center hover:bg-gray'
                  onClick={() => setShowCreatePostForm(true)}
                >
                  <p className='text-md'>What`s on your mind?</p>
                </button>
            </div>

            {/* create post modal */}
            <Modal
              isOpen={showCreatePostForm}
              onRequestClose={() => setShowCreatePostForm(false)}
              style={createPostModalStyle}
            >
              <CreatePost 
                props={{
                    currentUserID: user.uid,
                    pets: userPets,
                    displayName: displayName,
                    username: username,
                    userPhotoURL: userPhotoURL,
                    setShowCreatePostForm: setShowCreatePostForm
                }}
              />
            </Modal>

            {/* container */}
            <div className='flex flex-col w-fit items-center gap-8 mt-8 mb-14'>
              {allPosts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate))
                  .map((post) => (
                      <PostSnippet key={post.id} 
                          props={{
                              currentUserID: user.uid,
                              postID: post.id,
                              postBody: post.postBody,
                              postCategory: post.postCategory,
                              postPets: post.postPets,
                              postDate: post.postDate,
                              imageUrls: post.imageUrls,
                              authorID: post.authorID,
                              authorDisplayName: post.authorDisplayName,
                              authorUsername: post.authorUsername,
                              authorPhotoURL: post.authorPhotoURL,
                              likes: post.likes,
                              comments: post.comments,
                          }} 
                      />
                  ))
              }
            </div>
          </div>
        </div>

        {/* right navbar */}
        <div className='w-1/6 bg-snow drop-shadow-xl h-screen p-10 flex flex-col'>
          {/* menu */}
          <div className='flex flex-col gap-4 mt-6 mb-6'>
            <h1 className='font-bold text-mustard text-3xl mb-2'>Menu</h1>

            <button onClick={() => router.push('/PetTracker')} className='group flex flex-row items-center gap-2'>
              <i className='fa-solid fa-paw w-[40px] h-[40px] rounded-full bg-grass flex items-center justify-center text-xl text-snow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-lg group-hover:text-raisin_black'>Pet Tracker</p>
           </button>

            <button className='group flex flex-row items-center gap-2'>
              <i className='fa-solid fa-envelope w-[40px] h-[40px] rounded-full bg-grass flex items-center justify-center text-xl text-snow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-lg group-hover:text-raisin_black'>Messages</p>
            </button>

            <button className='group flex flex-row items-center gap-2'>
              <i className='fa-solid fa-bookmark w-[40px] h-[40px] rounded-full bg-grass flex items-center justify-center text-xl text-snow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-lg group-hover:text-raisin_black'>Saved Posts</p>
            </button>

            <button className='group flex flex-row items-center gap-2'>
              <i className='fa-solid fa-cart-shopping w-[40px] h-[40px] rounded-full bg-grass flex items-center justify-center text-xl text-snow group-hover:bg-raisin_black'></i>
              <p className='text-grass text-lg group-hover:text-raisin_black'>Shops</p>
            </button>
          </div>

          <hr className='text-dark_gray'/>

        {/* events */}
          <div className='flex flex-col mt-6'>
            <h1 className='font-bold text-mustard text-3xl mb-2'>Events</h1>

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