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

export default function AboutUs() {

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
    const [allLostPostsLoaded, setAllLostPostsLoaded] = useState(false);

    // States for Found Pets
    const [foundPets, setFoundPets] = useState([]);
    const [lastVisibleFound, setLastVisibleFound] = useState(null);
    const [loadingFound, setLoadingFound] = useState(false);
    const [allFoundPostsLoaded, setAllFoundPostsLoaded] = useState(false);

    

    const [showPhoneNavModal, setShowPhoneNavModal] = useState(false);

    if (!pageLoading) {
        return (
        <div className='flex flex-row w-full h-screen overflow-hidden'>
            <div className='hidden lg:flex lg:w-[300px]'>
                {(userPhotoURL && username) && <ExpandedNavBar 
                    props={{
                        userPhotoURL: userPhotoURL,
                        username: username,
                        activePage: "",
                        expanded: true
                    }}
                />}
            </div>

            <div className='w-fit md:flex lg:hidden hidden'>
                {(userPhotoURL && username) && <ExpandedNavBar 
                    props={{
                        userPhotoURL: userPhotoURL,
                        username: username,
                        activePage: "",
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

                {/* main container */}
                <div className='h-full w-full overflow-y-scroll flex flex-col justify-start items-center pt-5 pb-10'>
                    <h1 className='text-raisin_black text-3xl font-bold mb-4'>Meet the Team!</h1>

                    <div>
                        {/* Team Lead */}
                        <div className='flex flex-col items-center'>
                            <p className='font-bold text-lg text-grass'>Team Lead</p>
                            <button className='mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button>
                            <p className='opacity-60'>Anne Sulit</p>
                        </div>

                        <div className='flex'>
                            {/* Developers */}
                            <div className='flex flex-col mt-4 mr-4 items-center'>
                            <p className='font-bold text-lg text-grass'>Developers</p>
                                <div className='flex'>
                                    <div className='flex flex-col items-center'>
                                        <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button>
                                        <p className='mr-4 opacity-60'>Andre Aquino</p>
                                    </div>
                                    
                                    <div className='flex flex-col items-center'>
                                        <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button>
                                        <p className='mr-4 opacity-60'>Dominic Baccay</p>
                                    </div>
                                </div>
                            </div>

                            {/* QA Testers */}
                            <div className='flex flex-col mt-4 items-center'>
                            <p className='font-bold text-lg text-grass'>QA Testers</p>
                                <div className='flex'>
                                    <div className='flex flex-col items-center'>
                                        <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button>
                                        <p className='mr-4 opacity-60'>Bien Miranda</p>
                                    </div>
                                    
                                    <div className='flex flex-col items-center'>
                                        <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button>
                                        <p className='mr-4 opacity-60'>Luis Rana</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Designers */}
                        <div className='flex flex-col items-center mb-8'>
                        <p className='font-bold text-lg text-grass mt-4'>Designers</p>
                            <div className='flex'>
                                <div className='flex flex-col items-center'>
                                    <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button>
                                    <p className='mr-4 opacity-60'>Ysobella Torio</p>
                                </div>
                                
                                <div className='flex flex-col items-center'>
                                    <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button>
                                    <p className='mr-4 opacity-60'>Cedric Alejo</p>
                                </div>

                                <div className='flex flex-col items-center'>
                                    <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button>
                                    <p className='mr-4 opacity-60'>Rain David</p>
                                </div>
                                
                                <div className='flex flex-col items-center'>
                                    <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button>
                                    <p className='mr-4 opacity-60'>Kimberly Tan</p>
                                </div>
                            </div>
                        </div>

                        
                    </div>

                    <div className='fixed bottom-4 right-4'>
                        <div className='flex flex-row justify-center items-center gap-2 mr-8 transition-transform transform hover:scale-105'>
                            <h1 className='font-shining text-3xl text-grass'>BantayBuddy</h1>

                            <div className='bg-grass w-[40px] h-[40px] rounded-full shadow-lg'>
                            <Image src='/images/logo.png' alt='logo' width={100} height={100} className='rounded-full'/>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
        )
    } else return null;
}
