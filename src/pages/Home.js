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

  const [loading, setLoading] = useState(false);
  
  const [allPosts, setAllPosts] = useState([]);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [allPostsLastVisible, setAllPostsLastVisible] = useState(null);
  
  const [following, setFollowing] = useState([]); 
  const [followingPosts, setFollowingPosts] = useState([]);
  const [followingPostsLoaded, setFollowingPostsLoaded] = useState(false);
  const [followingLastVisible, setFollowingLastVisible] = useState(null);

  useEffect(() => {
    setPageLoading(true);

    // Fetch the 'following' array from the current user's document
    const fetchFollowing = async () => {
        const userDoc = await firestore.collection("users").doc(user.uid).get();
        setFollowing(userDoc.data().following);
        return userDoc.data().following;
    };

    fetchFollowing().then((following) => {
        const allPostsQuery = query(
            collection(firestore, "posts"),
            orderBy("postDate", "desc"),
            limit(5)
        );

        const allPostsUnsubscribe = onSnapshot(allPostsQuery, (snapshot) => {
            const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllPostsLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setAllPosts(newPosts);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setPageLoading(false);
        });

        // Only make the query if 'following' is not empty
        if (following.length > 0) {
            const followingPostsQuery = query(
                collection(firestore, "posts"),
                where("authorID", "in", following),
                orderBy("postDate", "desc"),
                limit(5)
            );

            const followingPostsUnsubscribe = onSnapshot(followingPostsQuery, (snapshot) => {
                const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFollowingLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setFollowingPosts(newPosts);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching posts:", error);
                setPageLoading(false);
            });

            // Return the cleanup function to unsubscribe from the listener
            return () => {
                allPostsUnsubscribe();
                followingPostsUnsubscribe();
            };
        } else {
            // Return the cleanup function to unsubscribe from the listener
            return () => {
                allPostsUnsubscribe();
            };
        }
    });
}, []); // Ensure this effect only runs once on component mount

  const fetchMoreAllPosts = async () => {
    if (allPostsLastVisible && !loading) {
        setLoading(true);
        const nextQuery = query(
          collection(firestore, "posts"),
          orderBy("postDate", "desc"), 
          startAfter(allPostsLastVisible), 
          limit(5)
        );

        const querySnapshot = await getDocs(nextQuery);
        const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Update state based on whether new posts are fetched
        if (newPosts.length === 0) {
          setAllPostsLoaded(true);
        } else {
          setAllPostsLastVisible(newLastVisible);
          setAllPosts(prevPosts => [...prevPosts, ...newPosts]);
          setAllPostsLoaded(false);
        }

        setLoading(false);
    }
  };

  const refreshAllPosts = async () => {
    setLoading(true);
    const refreshQuery = query(
      collection(firestore, "posts"),
      orderBy("postDate", "desc"),
      limit(5)
    );

    const querySnapshot = await getDocs(refreshQuery);
    const refreshedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllPosts(refreshedPosts);
    setAllPostsLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setAllPostsLoaded(false);
    setLoading(false);
  };

  const fetchMoreFollowingPosts = async () => {
    if (followingLastVisible && !loading) {
        setLoading(true);
        const nextQuery = query(
          collection(firestore, "posts"),
          where("authorID", "in", following),
          orderBy("postDate", "desc"), 
          startAfter(followingLastVisible), 
          limit(5)
        );

        const querySnapshot = await getDocs(nextQuery);
        const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Update state based on whether new posts are fetched
        if (newPosts.length === 0) {
          setFollowingPostsLoaded(true);
        } else {
          setFollowingLastVisible(newLastVisible);
          setFollowingPosts(prevPosts => [...prevPosts, ...newPosts]);
          setFollowingPostsLoaded(false);
        }

        setLoading(false);
    }
  };

  const refreshFollowingPosts = async () => {
    setLoading(true);
    const refreshQuery = query(
      collection(firestore, "posts"),
      where("authorID", "in", following),
      orderBy("postDate", "desc"),
      limit(5)
    );

    const querySnapshot = await getDocs(refreshQuery);
    const refreshedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFollowingPosts(refreshedPosts);
    setFollowingLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setFollowingPostsLoaded(false);
    setLoading(false);
  };

  const [showPhoneNavModal, setShowPhoneNavModal] = useState(false);
  const [activeContainer, setActiveContainer] = useState('For You');

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

        <div className='w-fit md:flex lg:hidden hidden'>
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

            <div className='flex flex-col justify-center items-center md:pt-10 pb-10'>
              {/* create post */}
              <div 
                className='group flex flex-row w-screen md:w-[650px] md:h-[80px] bg-snow drop-shadow-sm rounded-lg justify-evenly items-center hover:drop-shadow-md p-3 md:p-2 gap-2'>

                  {userPhotoURL && <Image
                    src={userPhotoURL}
                    alt="user photo"
                    width={50}
                    height={50}
                    onClick={() => router.push(`/user/${username}`)}
                    className='rounded-full min-h-[50px] min-w-[50px] hover:opacity-60 transition-all cursor-pointer'
                  />}

                  <button onClick={() => setShowCreatePostForm(true)} className='h-[50px] w-[75%] bg-dark_gray rounded-md text-left md:pl-4 pl-4 pr-4 text-[11px] lg:text-sm text-raisin_black hover:opacity-60 transition-all'>
                    <p>What&apos;s on your mind, {displayName}?</p>
                  </button>

                  <button onClick={() => setShowCreatePostForm(true)} className='min-h-[50px] min-w-[50px] bg-dark_gray rounded-full text-left text-lg text-raisin_black hover:bg-grass hover:text-pale_yellow transition-all flex items-center justify-center'>
                    <i className='fa-solid fa-image'/>
                  </button>

                  <Modal
                    isOpen={showCreatePostForm}
                    onRequestClose={() => setShowCreatePostForm(false)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  w-full h-full md:w-[70%] lg:w-[50%] md:h-[80%] overflow-auto p-5 rounded-md bg-gray-100 z-50 bg-snow"
                    style={{
                      overlay: {
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1000,

                      }
                    }}
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

              <div className='w-screen md:w-[650px] h-[40px] rounded-lg drop-shadow-lg bg-snow mt-8 flex flex-row justify-center items-center'>
                  <button
                      onClick={() => setActiveContainer('For You')}
                      className={`transition-all w-1/2 h-full rounded-l-lg text-raisin_black font-shining text-xl hover:text-snow hover:bg-grass ${activeContainer === 'For You' ? "text-snow bg-grass" : ''}`}
                  >
                      For You
                  </button>

                  <button
                      onClick={() => setActiveContainer('Following')}
                      className={`transition-all w-1/2 h-full rounded-r-lg text-raisin_black font-shining text-xl hover:text-snow hover:bg-grass ${activeContainer === 'Following' ? 'text-snow bg-grass' : ''}`}
                  >
                      Following
                  </button>
              </div>

              { activeContainer === 'For You' &&
                <div className='w-full h-full justify-start items-center flex flex-col mt-8 mb-16 gap-8'>
                  
                  {allPosts.map((post, index) => {
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
                                      postID: post.id,
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
                      onClick={refreshAllPosts}
                    >
                      Refresh Posts
                    </button>
                  ) : (
                    <button
                      className={`px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all ${loading ? 'hidden' : 'flex'}`}
                      onClick={fetchMoreAllPosts}
                      disabled={loading}
                    >
                      Load More
                    </button>
                  )}
                  
                </div>
              }

              {
                activeContainer === 'Following' && 
                <div className='w-full h-full justify-start items-center flex flex-col mt-8 mb-16 gap-6'>
                  {followingPosts.length === 0 ? (
                    <>
                      <p className='font-shining text-xl'>
                        {following.length === 0 ? "You're not following anyone yet!" : "No posts from your following yet!"}
                      </p>
                      <button
                        className='px-4 py-2 text-white bg-grass rounded-lg font-shining hover:bg-raisin_black transition-all'
                        onClick={() => setActiveContainer('For You')}
                      >
                        Explore
                      </button>
                    </>
                  ) : (
                    <div className='w-full h-full justify-start items-center flex flex-col mt-8 mb-16 gap-8'>
                
                      {followingPosts.map((post, index) => {
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
                                          postID: post.id,
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

                      {followingPostsLoaded ? (
                        <button
                          className={`px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all ${loading ? 'hidden' : 'flex'}`}
                          onClick={refreshFollowingPosts}
                        >
                          Refresh Posts
                        </button>
                      ) : (
                        <button
                          className={`px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all ${loading ? 'hidden' : 'flex'}`}
                          onClick={fetchMoreFollowingPosts}
                          disabled={loading}
                        >
                          Load More
                        </button>
                      )}

                    </div>
                  )}
                </div>
              }
            </div>

          </div>
        </div>
      </div>   
    )
  } else return null;
}

export default withAuth(Home);