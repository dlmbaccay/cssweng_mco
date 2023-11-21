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
import { createPostModalStyle } from '../lib/modalstyle';


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

    const { user, username, description, email, displayName, userPhotoURL } = useUserData();
    const router = Router;
    const [ pageLoading, setPageLoading ] = useState(true);
    const [ isSearchInputFocused, setIsSearchInputFocused ] = useState(false);
    const [ showCreatePostForm, setShowCreatePostForm ] = useState(false);

    const [activeContainer, setActiveContainer] = useState('Lost Pets');

    // States for Lost Pets
    const [lostPets, setLostPets] = useState([]);
    const [lastVisibleLost, setLastVisibleLost] = useState(null);
    const [loadingLost, setLoadingLost] = useState(false);

    // States for Found Pets
    const [foundPets, setFoundPets] = useState([]);
    const [lastVisibleFound, setLastVisibleFound] = useState(null);
    const [loadingFound, setLoadingFound] = useState(false);

    // Initial fetch for Lost Pets & Unknown Owner
    useEffect(() => {
        setLoadingLost(true);

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
            },
            (error) => {
                console.error("Error fetching lost pets posts:", error);
                setLoadingLost(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Initial fetch for Unknown Pets
    useEffect(() => {
        setLoadingFound(true);

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
            },
            (error) => {
                console.error("Error fetching found pets posts:", error);
                setLoadingFound(false);
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
            limit(3)
            );
            const querySnapshot = await getDocs(nextQuery);
            const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            setLastVisibleLost(newLastVisible);
            const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setLostPets(prevPosts => [...prevPosts, ...newPosts]);
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

            setFoundPets(prevPosts => [...prevPosts, ...newPosts]);
            setLoadingFound(false);
        }
    };

    if (!pageLoading) {
        return (
        <div className='flex flex-row w-full h-screen overflow-hidden'>
            <div className='hidden lg:flex lg:w-[300px]'>
                {(userPhotoURL && username) && <ExpandedNavBar 
                    props={{
                        userPhotoURL: userPhotoURL,
                        username: username,
                        activePage: "PetTracker",
                        expanded: true
                    }}
                />}
            </div>

            <div className='w-fit lg:hidden'>
                {(userPhotoURL && username) && <ExpandedNavBar 
                    props={{
                        userPhotoURL: userPhotoURL,
                        username: username,
                        activePage: "PetTracker",
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
                <div className='h-full w-full overflow-y-scroll flex flex-col justify-start items-center pt-10 pb-10'>
                    
                    {/* create post */}
                    <div 
                        className='group flex flex-row w-[650px] min-h-[80px] bg-snow drop-shadow-sm rounded-lg justify-evenly items-center hover:drop-shadow-md'>

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

                        <button onClick={() => setShowCreatePostForm(true)} className='h-[50px] w-[50px] bg-dark_gray rounded-full text-left text-lg text-raisin_black hover:text-pale_yellow hover:bg-grass transition-all flex items-center justify-center'>
                        <i className='fa-solid fa-image'/>
                        </button>

                        <Modal
                            isOpen={showCreatePostForm}
                            onRequestClose={() => setShowCreatePostForm(false)}
                            style={createPostModalStyle}
                        >
                            <CreatePost 
                            props={{
                                createType: 'tracker',
                                currentUserID: user.uid,
                                displayName: displayName,
                                username: username,
                                userPhotoURL: userPhotoURL,
                                setShowCreatePostForm: setShowCreatePostForm,
                            }}
                            />
                        </Modal>
                    </div>

                    <div className='w-[650px] min-h-[40px] rounded-lg drop-shadow-lg bg-snow mt-8 mb-8 flex flex-row justify-center items-center'>
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
                                {lastVisibleLost && (
                                    <button 
                                    onClick={fetchMoreLostPets} 
                                    disabled={loadingLost} 
                                    className='px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'>
                                        Load More
                                    </button>
                            
                                )}
                                </div>
                            )}
                            {activeContainer === 'Retrieved Pets' && (
                                <div className='w-full flex flex-col justify-start gap-8 items-center'>
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
                                {lastVisibleFound && (
                                    <button 
                                    onClick={fetchMoreFoundPets} 
                                    disabled={loadingLost} 
                                    className='px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'>
                                        Load More
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
