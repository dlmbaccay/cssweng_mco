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
import ExpandedNavBar from '../components/ExpandedNavBar';
import PhoneNav from '../components/PhoneNav';
import { createPostModalStyle, phoneNavModalStyle } from '../lib/modalstyle';
import Loader from '../components/Loader';

export default function PetTracker() {

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

    const { user, username, description, email, displayName, userPhotoURL, notifications, reportCount, lostPetPostsCount } = useUserData();
    const router = Router;
    const [ pageLoading, setPageLoading ] = useState(true);
    const [ isSearchInputFocused, setIsSearchInputFocused ] = useState(false);
    const [ showCreatePostForm, setShowCreatePostForm ] = useState(false);

    const [activeContainer, setActiveContainer] = useState('Lost Pets');

    // States for Lost Pets
    const [lostPets, setLostPets] = useState([]);
    const [lastVisibleLost, setLastVisibleLost] = useState(null);
    const [loadingLost, setLoadingLost] = useState(false);
    const [allLostPostsLoaded, setAllLostPostsLoaded] = useState(false);

    // States for Found Pets
    const [foundPets, setFoundPets] = useState([]);
    const [lastVisibleFound, setLastVisibleFound] = useState(null);
    const [loadingFound, setLoadingFound] = useState(false);
    const [allFoundPostsLoaded, setAllFoundPostsLoaded] = useState(false);

    // Initial fetch for Lost Pets & Unknown Owner
    useEffect(() => {
        setLoadingLost(true);
        setPageLoading(true);

        const q = query(
            collection(firestore, "posts"), 
            where("postCategory", "in", ["Lost Pets", "Unknown Owner"]),
            orderBy("postDate", "desc"), 
            limit(5)
        );

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLastVisibleLost(snapshot.docs[snapshot.docs.length - 1]);
                setLostPets(newPosts);
                setLoadingLost(false);
                setPageLoading(false);
            },
            (error) => {
                console.error("Error fetching lost pets posts:", error);
                setLoadingLost(false);
                setPageLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Initial fetch for Unknown Pets
    useEffect(() => {
        setLoadingFound(true);
        setPageLoading(true);

        const q = query(
            collection(firestore, "posts"), 
            where("postCategory", "==", "Retrieved Pets"),
            orderBy("postDate", "desc"), 
            limit(5)
        );

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLastVisibleFound(snapshot.docs[snapshot.docs.length - 1]);
                setFoundPets(newPosts);
                setLoadingFound(false);
                setPageLoading(false);
            },
            (error) => {
                console.error("Error fetching found pets posts:", error);
                setLoadingFound(false);
                setPageLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Fetch more Lost Pets & Unknown Owner
    const fetchMoreLostPets = async () => {
        if (lastVisibleLost && !loadingLost) {
            setLoadingLost(true);
            const nextQuery = query(
                collection(firestore, "posts"), 
                where("postCategory", "in", ["Lost Pets", "Unknown Owner"]),
                orderBy("postDate", "desc"), 
                startAfter(lastVisibleLost), 
                limit(5)
            );
            const querySnapshot = await getDocs(nextQuery);
            const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            setLastVisibleLost(newLastVisible);
            const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (newPosts.length === 0) {
                setAllLostPostsLoaded(true);
            } else {
                setLostPets(prevPosts => [...prevPosts, ...newPosts]);
                setAllLostPostsLoaded(false);
            }

            setLoadingLost(false);
        }
    };

    // Fetch more Retrieved Pets
    const fetchMoreFoundPets = async () => {
        if (lastVisibleFound && !loadingFound) {
            setLoadingFound(true);
            const nextQuery = query(
                collection(firestore, "posts"), 
                where("postCategory", "==", "Retrieved Pets"),
                orderBy("postDate", "desc"), 
                startAfter(lastVisibleFound), 
                limit(5)
            );
            const querySnapshot = await getDocs(nextQuery);
            const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            setLastVisibleFound(newLastVisible);
            const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(post => post.postCategory === "Found Pets");

            if (newPosts.length === 0) {
                setAllFoundPostsLoaded(true);
            } else {
                setFoundPets(prevPosts => [...prevPosts, ...newPosts]);
                setAllFoundPostsLoaded(false);
            }

            setLoadingFound(false);
        }
    };

    // Function to refresh Lost Pets
    const refreshLostPets = async () => {
        setLoadingLost(true);
        const refreshQuery = query(
            collection(firestore, "posts"), 
            where("postCategory", "in", ["Lost Pets", "Unknown Owner"]),
            orderBy("postDate", "desc"), 
            limit(5)
        );

        const querySnapshot = await getDocs(refreshQuery);
        const refreshedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLostPets(refreshedPosts);
        setLastVisibleLost(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setAllLostPostsLoaded(false);
        setLoadingLost(false);
    };

    // Function to refresh Found Pets
    const refreshFoundPets = async () => {
        setLoadingFound(true);
        const refreshQuery = query(
            collection(firestore, "posts"), 
            where("postCategory", "==", "Retrieved Pets"),
            orderBy("postDate", "desc"), 
            limit(5)
        );

        const querySnapshot = await getDocs(refreshQuery);
        const refreshedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFoundPets(refreshedPosts);
        setLastVisibleFound(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setAllFoundPostsLoaded(false);
        setLoadingFound(false);
    };

    const [showPhoneNavModal, setShowPhoneNavModal] = useState(false);

    if (!pageLoading) {
        return (
        <div className='flex flex-row w-full h-screen overflow-hidden'>
            <div className='hidden lg:flex lg:w-[330px]'>
                {(userPhotoURL && username) && <ExpandedNavBar 
                    props={{
                        userPhotoURL: userPhotoURL,
                        username: username,
                        activePage: "PetTracker",
                        expanded: true,
                        notifications: notifications,
                        lostPetPostsCount: lostPetPostsCount
                    }}
                />}
            </div>

            <div className='w-fit md:flex lg:hidden hidden'>
                {(userPhotoURL && username) && <ExpandedNavBar 
                    props={{
                        userPhotoURL: userPhotoURL,
                        username: username,
                        activePage: "PetTracker",
                        expanded: false,
                        notifications: notifications,
                        lostPetPostsCount: lostPetPostsCount
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
                            notifications: notifications,
                        }}
                        />
                    </Modal>
                </nav>

                {/* search and logo bar */}
                <div className='w-full bg-snow drop-shadow-lg h-14 md:flex flex-row justify-between hidden z-10'>
                    
                    <div className='group flex flex-row w-[400px] items-center justify-center h-full ml-8 drop-shadow-sm'>
                        {/* <i
                        className={`fa-solid fa-search w-[40px] h-8 text-sm font-bold flex justify-center items-center rounded-l-lg transition-all cursor-pointer group-hover:bg-grass group-hover:text-pale_yellow ${isSearchInputFocused ? 'bg-grass text-pale_yellow' : 'bg-dark_gray'}`}
                        // onClick={}
                        />
                        <input 
                        type='text'
                        placeholder='Search'
                        className={`w-full h-8 pl-2 pr-4 outline-none rounded-r-lg bg-dark_gray transition-all text-sm group-hover:bg-white ${isSearchInputFocused ? 'bg-white' : 'bg_dark_gray'}`}
                        onFocus={() => setIsSearchInputFocused(true)}
                        onBlur={() => setIsSearchInputFocused(false)}
                        /> */}
                    </div>

                    <div className='flex flex-row justify-center items-center gap-2 mr-8'>
                        <h1 className='font-shining text-3xl text-grass'>BantayBuddy</h1>

                        <div className='bg-grass w-[40px] h-[40px] rounded-full shadow-lg'>
                        <Image src='/images/logo.png' alt='logo' width={100} height={100} className='rounded-full'/>
                        </div>
                    </div>
                </div>  

                {/* main container */}
                <div className='h-full w-full overflow-y-scroll flex flex-col justify-start items-center md:pt-10 pb-10'>
                    
                    {/* create post */}
                    <div 
                        className='group flex flex-row w-screen md:w-[650px] md:h-[80px] bg-snow drop-shadow-sm rounded-lg justify-evenly items-center hover:drop-shadow-md p-3 md:p-2 gap-2'>

                        {userPhotoURL && <Image
                        src={userPhotoURL}
                        alt="user photo"
                        width={100}
                        height={100}
                        onClick={() => router.push(`/user/${username}`)}
                        className='rounded-full h-[50px] w-[50px] hover:opacity-60 transition-all cursor-pointer aspect-square object-cover'
                        />}

                        <button onClick={() => setShowCreatePostForm(true)} className='h-[50px] w-[75%] bg-dark_gray rounded-md text-left md:pl-4 pl-4 pr-4 text-[11px] lg:text-sm text-raisin_black hover:opacity-60 transition-all'>
                        <p>What&apos;s on your mind, {displayName}?</p>
                        </button>

                        <button onClick={() => setShowCreatePostForm(true)} className='min-h-[50px] min-w-[50px] bg-dark_gray rounded-full text-left text-lg text-raisin_black hover:text-pale_yellow hover:bg-grass transition-all flex items-center justify-center'>
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
                                createType: 'tracker',
                                currentUserID: user.uid,
                                reportCount: reportCount,
                                displayName: displayName,
                                username: username,
                                userPhotoURL: userPhotoURL,
                                setShowCreatePostForm: setShowCreatePostForm,
                            }}
                            />
                        </Modal>
                    </div>

                    <div className='w-screen md:w-[650px] min-h-[40px] rounded-lg drop-shadow-lg bg-snow mt-8 mb-8 flex flex-row justify-center items-center'>
                        <button
                            onClick={() => setActiveContainer('Lost Pets')}
                            className={`transition-all w-1/2 h-full rounded-l-lg text-raisin_black font-shining text-xl hover:text-snow hover:bg-grass ${activeContainer === 'Lost Pets' ? "text-snow bg-grass" : ''}`}
                        >
                            Lost Pets
                        </button>

                        <button
                            onClick={() => setActiveContainer('Retrieved Pets')}
                            className={`transition-all w-1/2 h-full rounded-r-lg text-raisin_black font-shining text-xl hover:text-snow hover:bg-grass ${activeContainer === 'Retrieved Pets' ? 'text-snow bg-grass' : ''}`}
                        >
                            Retrieved Pets
                        </button>
                    </div>

                    <div>
                        <div className='w-full h-full justify-start items-center flex flex-col mb-16 gap-8'>
                            {activeContainer === 'Lost Pets' && (
                                <div className='w-full flex flex-col justify-start gap-8 items-center'>
                                    
                                    {/* if no lost pets */}
                                    {lostPets.length === 0 && (
                                        <div className='w-full flex flex-col justify-center items-center gap-4'>
                                            <h1 className='text-2xl font-shining text-raisin_black'>No lost pets!</h1>
                                        </div>
                                    )}

                                    {lostPets.map((post, index) => (
                                        <PostSnippet key={post.id}
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
                                    ))}
                                    {loadingLost && <div>Loading...</div>}
                                    {!allLostPostsLoaded && lastVisibleLost && (
                                        <button 
                                        onClick={fetchMoreLostPets} 
                                        disabled={loadingLost} 
                                        className='px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'>
                                            Load More
                                        </button>
                                    )}
                                    {allLostPostsLoaded && (
                                        <button 
                                        onClick={refreshLostPets} 
                                        className='px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'>
                                            Refresh Posts
                                        </button>
                                    )}
                                </div>
                            )}
                            {activeContainer === 'Retrieved Pets' && (
                                <div className='w-full flex flex-col justify-start gap-8 items-center'>

                                    {/* if no found pets */}
                                    {foundPets.length === 0 && (
                                        <div className='w-full flex flex-col justify-center items-center gap-4'>
                                            <h1 className='text-2xl font-shining text-raisin_black'>No retrieved pets!</h1>
                                        </div>
                                    )}

                                    {foundPets.map((post, index) => (
                                        <PostSnippet key={post.id}
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
                                    ))}
                                    {loadingFound && <div>Loading...</div>}
                                    {!allFoundPostsLoaded && lastVisibleFound && (
                                        <button 
                                        onClick={fetchMoreFoundPets} 
                                        disabled={loadingFound} 
                                        className='px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'>
                                            Load More
                                        </button>
                                    )}
                                    {allFoundPostsLoaded && (
                                        <button 
                                        onClick={refreshFoundPets} 
                                        className='px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'>
                                            Refresh Posts
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )
    } else return null;
}
