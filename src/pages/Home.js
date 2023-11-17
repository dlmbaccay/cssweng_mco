import React, { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs } from 'firebase/firestore';
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
  const [ isSearchInputFocused, setIsSearchInputFocused ] = useState(false);
  const [ showCreatePostForm, setShowCreatePostForm ] = useState(false);

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) { // User is signed in.
          setPageLoading(false);
        } else { // No user is signed in.
          setPageLoading(true);
        }
      });

      return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // const [posts, setPosts] = useState([]);
  // const [lastVisible, setLastVisible] = useState(null);
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setLoading(true);

  //   // indexed in query builder
  //   const q = query(
  //     collection(firestore, "posts"),
  //     orderBy("postDate", "desc"),
  //     limit(5)
  //   )

  //   const unsubscribe = onSnapshot(q, 
  //       (snapshot) => {
  //           const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            
  //           setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
  //           setPosts(newPosts);
  //           setLoading(false);
  //       },
  //       (error) => {
  //           console.error("Error fetching posts:", error);
  //           setLoading(false);
  //       }
  //   );

  //   return () => unsubscribe();
  // }, []);

  // const fetchMorePosts = async () => {
  //   if (lastVisible && !loading) {
  //       setLoading(true);
  //       const nextQuery = query(
  //         collection(firestore, "posts"),
  //         orderBy("postDate", "desc"), 
  //         startAfter(lastVisible), 
  //         limit(5)
  //       );

  //       const querySnapshot = await getDocs(nextQuery);
  //       const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  //       setLastVisible(newLastVisible);

  //       const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  //       setPosts(prevPosts => [...prevPosts, ...newPosts]);
  //       setLoading(false);
  //   }
  // };

  if (!pageLoading) {
    return (
      <div className='flex flex-row w-full h-screen overflow-hidden'>

        <div className='w-1/5'>
          {(userPhotoURL && username) && <ExpandedNavBar 
            props={{
              userPhotoURL: userPhotoURL,
              username: username,
              activePage: "Home"
            }}
        />}
        </div>

        <div className='w-4/5 bg-dark_gray'>            
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
                className={`w-full h-8 pl-2 pr-4 outline-none rounded-r-lg bg-dark_gray transition-all text-sm ${isSearchInputFocused ? 'bg-dark_gray' : 'bg_dark_gray'}`}
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

            <div className='flex flex-col justify-center items-center pt-10 pb-10'>
              {/* create post */}
              <div className='flex flex-row w-[700px] min-h-[100px] bg-snow drop-shadow-lg p-4 gap-2 rounded-3xl items-center justify-between'>
                  {userPhotoURL && 
                    <div className='h-full w-[10%] flex justify-center items-center'>
                      <Image src={userPhotoURL} alt={'profile picture'} width={55} height={55} className='h-[55px] w-[55px] rounded-full drop-shadow-lg'/>
                    </div>
                  }
                  <button
                      className='h-[60px] w-[80%] text-sm rounded-xl bg-dark_gray flex pl-4 items-center hover:opacity-90 drop-shadow-sm'
                      onClick={() => setShowCreatePostForm(true)}
                  >
                      What`s on your mind, {displayName}?
                  </button>

                  {/* create post modal */}
                  <Modal
                      isOpen={showCreatePostForm}
                      onRequestClose={() => setShowCreatePostForm(false)}
                      style={createPostModalStyle}
                  >
                      <CreatePost 
                        props={{
                            currentUserID: user.uid,
                            displayName: displayName,
                            username: username,
                            userPhotoURL: userPhotoURL,
                            setShowCreatePostForm: setShowCreatePostForm,
                        }}
                      />
                  </Modal>
              </div>

              {/* <div className='w-full h-full justify-start items-center flex flex-col mt-8 mb-16 gap-8'>
                
                {posts.map((post, index) => (
                    <div key={post.id}>
                      <PostSnippet
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
                    </div>
                ))}

                {loading && <div>Loading...</div>}

                {lastVisible && (
                  <button
                    className='px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'
                    onClick={fetchMorePosts}
                    disabled={loading}
                  >
                    Load More
                  </button>
                )}
              </div> */}
            </div>

          </div>
        </div>
      </div>   
    )
  } else {
    return null;
  }
}

export default withAuth(Home);