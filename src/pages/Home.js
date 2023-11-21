import React, { useEffect, useState } from 'react'
import { auth, firestore } from '../lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs } from 'firebase/firestore';
import { useUserData } from '../lib/hooks';
import withAuth from '../components/withAuth';

import Router from 'next/router';
import Modal from 'react-modal';
import Image from 'next/image';

import CreatePost from '../components/Post/CreatePost';
import PostSnippet from '../components/Post/PostSnippet';
import Repost from '../components/Post/Repost';
import ExpandedNavBar from '../components/ExpandedNavBar';
import { createPostModalStyle } from '../lib/modalstyle';

function Home() {

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

  const { user, username, description, email, displayName, userPhotoURL } = useUserData();
  const router = Router;
  const [ pageLoading, setPageLoading ] = useState(true);
  const [ isSearchInputFocused, setIsSearchInputFocused ] = useState(false);
  const [ showCreatePostForm, setShowCreatePostForm ] = useState(false);

  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  
  useEffect(() => {
      setLoading(true);

      const q = query(
        collection(firestore, "posts"),
        orderBy("postDate", "desc"),
        limit(5)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
          const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setPosts(newPosts);
          setLoading(false);
      }, (error) => {
          console.error("Error fetching posts:", error);
          setLoading(false);
      });

      // Return the cleanup function to unsubscribe from the listener
      return () => unsubscribe();
  }, []); // Ensure this effect only runs once on component mount

  const fetchMorePosts = async () => {
    if (lastVisible && !loading) {
        setLoading(true);
        const nextQuery = query(
          collection(firestore, "posts"),
          orderBy("postDate", "desc"), 
          startAfter(lastVisible), 
          limit(5)
        );

        const querySnapshot = await getDocs(nextQuery);
        const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Update state based on whether new posts are fetched
        if (newPosts.length === 0) {
          setAllPostsLoaded(true);
        } else {
          setLastVisible(newLastVisible);
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
          setAllPostsLoaded(false);
        }

        setLoading(false);
    }
  };

  const refreshPosts = async () => {
    setLoading(true);
    const refreshQuery = query(
      collection(firestore, "posts"),
      orderBy("postDate", "desc"),
      limit(5)
    );

    const querySnapshot = await getDocs(refreshQuery);
    const refreshedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPosts(refreshedPosts);
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setAllPostsLoaded(false);
    setLoading(false);
  };

  if (!pageLoading) {
    return (
      <div className='flex flex-row w-full h-screen overflow-hidden'>

        <div className='hidden lg:flex lg:w-[300px]'>
          {(userPhotoURL && username) && <ExpandedNavBar 
              props={{
                userPhotoURL: userPhotoURL,
                username: username,
                activePage: "Home",
                expanded: true
              }}
          />}
        </div>

        <div className='w-fit lg:hidden'>
          {(userPhotoURL && username) && <ExpandedNavBar 
              props={{
                userPhotoURL: userPhotoURL,
                username: username,
                activePage: "Home",
                expanded: false
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
                  <h1 className='font-shining text-3xl text-grass'>BantayBuddy</h1>

                  <div className='bg-grass w-[40px] h-[40px] rounded-full shadow-lg'>
                  <Image src='/images/logo.png' alt='logo' width={100} height={100} className='rounded-full'/>
                  </div>
              </div>
          </div>  

          {/* main container */}
          <div className='h-full w-full overflow-y-scroll'>

            <div className='flex flex-col justify-center items-center pt-10 pb-10'>
              {/* create post */}
              <div 
                className='group flex flex-row w-[650px] h-[80px] bg-snow drop-shadow-sm rounded-lg justify-evenly items-center hover:drop-shadow-md  p-2 gap-2'>

                  {userPhotoURL && <Image
                    src={userPhotoURL}
                    alt="user photo"
                    width={50}
                    height={50}
                    onClick={() => router.push(`/user/${username}`)}
                    className='rounded-full h-[50px] w-[50px] hover:opacity-60 transition-all cursor-pointer'
                  />}

                  <button onClick={() => setShowCreatePostForm(true)} className='h-[50px] w-[75%] bg-dark_gray rounded-md text-left pl-4 text-sm text-raisin_black hover:opacity-60 transition-all'>
                    <p>What&apos;s on your mind, {displayName}?</p>
                  </button>

                  <button onClick={() => setShowCreatePostForm(true)} className='h-[50px] w-[50px] bg-dark_gray rounded-full text-left text-lg text-raisin_black hover:bg-grass hover:text-pale_yellow transition-all flex items-center justify-center'>
                    <i className='fa-solid fa-image'/>
                  </button>

                  <Modal
                      isOpen={showCreatePostForm}
                      onRequestClose={() => setShowCreatePostForm(false)}
                      style={createPostModalStyle}
                  >
                      <CreatePost 
                          props={{
                            createType: 'original',
                            currentUserID: user.uid,
                            displayName: displayName,
                            username: username,
                            userPhotoURL: userPhotoURL,
                            setShowCreatePostForm: setShowCreatePostForm,
                          }}
                      />
                  </Modal>
              </div>

              <div className='w-full h-full justify-start items-center flex flex-col mt-8 mb-16 gap-8'>
                
                {posts.map((post, index) => {
                  console.log(`Processing post ${index} with postType: ${post.postType}`);

                  if (post.postType === "original") {
                      return (
                        <div key={post.id}>
                            <PostSnippet
                                props={{
                                    currentUserID: user.uid,
                                    postID: post.id,
                                    postBody: post.postBody,
                                    postCategory: post.postCategory,
                                    postTrackerLocation: post.postTrackerLocation,
                                    postPets: post.postPets,
                                    postDate: post.postDate,
                                    imageUrls: post.imageUrls,
                                    authorID: post.authorID,
                                    authorDisplayName: post.authorDisplayName,
                                    authorUsername: post.authorUsername,
                                    authorPhotoURL: post.authorPhotoURL,
                                    isEdited: post.isEdited,
                                    postType: post.postType,
                                }}
                            />
                        </div>
                      );
                  } else if (post.postType === 'repost') {
                      return (
                        <div key={post.id}>
                            <Repost
                                props={{
                                  currentUserID: user.uid,
                                    authorID: post.authorID,
                                    authorDisplayName: post.authorDisplayName,
                                    authorUsername: post.authorUsername,
                                    authorPhotoURL: post.authorPhotoURL,
                                    id: post.id,
                                    postDate: post.postDate,
                                    postType: 'repost',
                                    postBody: post.postBody,
                                    isEdited: post.isEdited,
                                    repostID: post.repostID,
                                    repostBody: post.repostBody,
                                    repostCategory: post.repostCategory,
                                    repostPets: post.repostPets,
                                    repostDate: post.repostDate,
                                    repostImageUrls: post.repostImageUrls,
                                    repostAuthorID: post.repostAuthorID,
                                    repostAuthorDisplayName: post.repostAuthorDisplayName,
                                    repostAuthorUsername: post.repostAuthorUsername,
                                    repostAuthorPhotoURL: post.repostAuthorPhotoURL,
                                }}
                            />
                        </div>
                      );
                  } 
                })}

                {loading && <div>Loading...</div>}

                {allPostsLoaded ? (
                  <button
                    className={`px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all ${loading ? 'hidden' : 'flex'}`}
                    onClick={refreshPosts}
                  >
                    Refresh Posts
                  </button>
                ) : (
                  <button
                    className={`px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all ${loading ? 'hidden' : 'flex'}`}
                    onClick={fetchMorePosts}
                    disabled={loading}
                  >
                    Load More
                  </button>
                )}
                
              </div>
            </div>

          </div>
        </div>
      </div>   
    )
  } else return null;
}

export default withAuth(Home);