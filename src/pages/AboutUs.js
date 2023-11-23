import React, { useEffect, useState } from 'react'
import { auth, firestore } from '../lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, where } from 'firebase/firestore';
import { useUserData } from '../lib/hooks';
import withAuth from '../components/withAuth';
import Link from 'next/link';

import Router from 'next/router';
import Modal from 'react-modal';
import Image from 'next/image';

import CreatePost from '../components/Post/CreatePost';
import PostSnippet from '../components/Post/PostSnippet';
import ExpandedNavBar from '../components/ExpandedNavBar';
import PhoneNav from '../components/PhoneNav';
import { createPostModalStyle, phoneNavModalStyle } from '../lib/modalstyle';

import anne from '/public/images/team/SULIT.jpg'
import andre from '/public/images/team/AQUINO.jpg'
import doms from '/public/images/team/BACCAY.jpg'
import bella from '/public/images/team/Ysobella_Torio.jpg'
import luis from '/public/images/team/RANA.jpg'
import bien from '/public/images/team/Miranda_Bien.jpg'
import cedric from '/public/images/team/ALEJO.jpg'
import rain from '/public/images/team/DAVID.png'
import kim from '/public/images/team/TAN.jpg'

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

    const [isHovered, setIsHovered] = useState(false);
    const [isHovered1, setIsHovered1] = useState(false);
    const [isHovered2, setIsHovered2] = useState(false);
    const [isHovered3, setIsHovered3] = useState(false);
    const [isHovered4, setIsHovered4] = useState(false);
    const [isHovered5, setIsHovered5] = useState(false);
    const [isHovered6, setIsHovered6] = useState(false);
    const [isHovered7, setIsHovered7] = useState(false);
    const [isHovered8, setIsHovered8] = useState(false);
    const [isHovered9, setIsHovered9] = useState(false);

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
                    <h1 className='text-raisin_black text-4xl mb-10 font-shining'>Meet the Team!</h1>

                    

                    <div>
                        {/* Team Lead */}
                        <div className='flex flex-col items-center'>
                            <p className='text-2xl text-grass font-shining'>Team Lead</p>
                            {/* <button className='mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button> */}
                            
                            <div
                                className={`main flex flex-col gap-2 ${isHovered1 ? '' : 'hidden'}`}
                                onMouseLeave={() => setIsHovered1(false)}
                            >
                                {isHovered1 && (
                                    <>
                                    <div className="up flex flex-row gap-2 -mt-3">
                                        <Link href="mailto:anne_sulit@dlsu.edu.ph" target="_blank" rel="noopener noreferrer">
                                            <div className="card1 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-c63939">
                                                <div className="gmail mt-1.5 ml-1.2 fill-current text-white">
                                                <i className="fa-solid fa-envelope absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4"></i>
                                                </div>
                                            </div>
                                        </Link>
                                        <Link href="bantaybuddy.vercel.app/user/axsulit" target="_blank" rel="noopener noreferrer">
                                            <div className="card2 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-xanthous">
                                                <div className="bantaybuddy mt-1.5 ml--0.9 fill-current text-white">
                                                <i class="fa-solid fa-paw absolute top-1/2 left-7 transform -translate-x-1/2 -translate-y-1/4"></i>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="down flex flex-row gap-2 mt-3">
                                        <Link href="https://github.com/axsulit" target="_blank" rel="noopener noreferrer">
                                            <div className="card3 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-black">
                                                <div className="github mt--0.6 ml-1.2 fill-current text-white">
                                                    <i class="fa-solid fa-brands fa-github absolute top-7 left-1/2 transform -translate-x-1/4 -translate-y-1/2"></i>
                                                </div>
                                            </div>
                                        </Link>
                                        <Link href="https://linkedin.com/in/annesulit/" target="_blank" rel="noopener noreferrer">
                                            <div className="card4 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-blue-900">
                                                <div className="linkedin mt--0.6 ml--1.2 fill-current text-white">
                                                    <i class="fa-solid fa-brands fa-linkedin absolute top-7 left-7 transform -translate-x-1/2 -translate-y-1/2"></i>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    </>
                                )}
                                
                            </div>
                            
                            <Image
                                        src={anne}  // Replace this path with the correct path to your image
                                        alt="Anne Sulit"
                                        className={`mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                            isHovered1 ? 'hidden' : ''
                                            }`}
                                            onMouseEnter={() => setIsHovered1(true)}
                                    />

                            {/* <button
                                className={`mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                isHovered ? 'hidden' : ''
                                }`}
                                onMouseEnter={() => setIsHovered(true)}
                            ></button> */}

                            <p className='opacity-60'>Anne Sulit</p>
                        </div>

                        <div className='flex'>
                            {/* Developers */}
                            <div className='flex flex-col mt-4 mr-4 items-center'>
                            <p className='font-shining text-2xl text-grass'>Developers</p>
                                <div className='flex'>
                                    <div className='flex flex-col items-center'>
                                        {/* <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button> */}
                                        <div
                                        className={`mr-4 main flex flex-col gap-2 ${isHovered2 ? '' : 'hidden'}`}
                                        onMouseLeave={() => setIsHovered2(false)}
                                    >
                                        {isHovered2 && (
                                            <>
                                            <div className="up flex flex-row gap-2 -mt-3">
                                                <Link href="mailto:andre_aquino@dlsu.edu.ph" target="_blank" rel="noopener noreferrer">
                                                    <div className="card1 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-c63939">
                                                        <div className="gmail mt-1.5 ml-1.2 fill-current text-white">
                                                        <i className="fa-solid fa-envelope absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://bantaybuddy.vercel.app/user/andreee" target="_blank" rel="noopener noreferrer">
                                                    <div className="card2 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-xanthous">
                                                        <div className="bantaybuddy mt-1.5 ml--0.9 fill-current text-white">
                                                        <i class="fa-solid fa-paw absolute top-1/2 left-7 transform -translate-x-1/2 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="down flex flex-row gap-2 mt-3">
                                                <Link href="https://github.com/Andre0819" target="_blank" rel="noopener noreferrer">
                                                    <div className="card3 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-black">
                                                        <div className="github mt--0.6 ml-1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-github absolute top-7 left-1/2 transform -translate-x-1/4 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://www.linkedin.com/in/karl-andre-aquino/" target="_blank" rel="noopener noreferrer">
                                                    <div className="card4 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-blue-900">
                                                        <div className="linkedin mt--0.6 ml--1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-linkedin absolute top-7 left-7 transform -translate-x-1/2 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            </>
                                        )}
                                        
                                    </div>
                                    
                                    <Image
                                        src={andre}  // Replace this path with the correct path to your image
                                        alt="Andre Aquino"
                                        className={`mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                            isHovered2 ? 'hidden' : ''
                                            }`}
                                            onMouseEnter={() => setIsHovered2(true)}
                                    />
                                        <p className='mr-4 opacity-60'>Andre Aquino</p>
                                    </div>
                                    
                                    <div className='flex flex-col items-center'>
                                    <div
                                        className={`mr-4 main flex flex-col gap-2 ${isHovered3 ? '' : 'hidden'}`}
                                        onMouseLeave={() => setIsHovered3(false)}
                                    >
                                        {isHovered3 && (
                                            <>
                                            <div className="up flex flex-row gap-2 -mt-3">
                                                <Link href="mailto:dominic_baccay@dlsu.edu.ph" target="_blank" rel="noopener noreferrer">
                                                    <div className="card1 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-c63939">
                                                        <div className="gmail mt-1.5 ml-1.2 fill-current text-white">
                                                        <i className="fa-solid fa-envelope absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="bantaybuddy.vercel.app/user/dlmbaccay" target="_blank" rel="noopener noreferrer">
                                                    <div className="card2 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-xanthous">
                                                        <div className="bantaybuddy mt-1.5 ml--0.9 fill-current text-white">
                                                        <i class="fa-solid fa-paw absolute top-1/2 left-7 transform -translate-x-1/2 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="down flex flex-row gap-2 mt-3">
                                                <Link href="https://github.com/dlmbaccay" target="_blank" rel="noopener noreferrer">
                                                    <div className="card3 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-black">
                                                        <div className="github mt--0.6 ml-1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-github absolute top-7 left-1/2 transform -translate-x-1/4 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://www.linkedin.com/in/dlmbaccay" target="_blank" rel="noopener noreferrer">
                                                    <div className="card4 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-blue-900">
                                                        <div className="linkedin mt--0.6 ml--1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-linkedin absolute top-7 left-7 transform -translate-x-1/2 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            </>
                                        )}
                                        
                                    </div>
                                    
                                    <Image
                                        src={doms}  // Replace this path with the correct path to your image
                                        alt="Dominic Baccay"
                                        className={`mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                            isHovered3 ? 'hidden' : ''
                                            }`}
                                            onMouseEnter={() => setIsHovered3(true)}
                                    />
                                        <p className='mr-4 opacity-60'>Dominic Baccay</p>
                                    </div>
                                </div>
                            </div>

                            {/* QA Testers */}
                            <div className='flex flex-col mt-4 items-center'>
                            <p className='font-shining text-2xl text-grass'>QA Testers</p>
                                <div className='flex'>
                                    <div className='flex flex-col items-center'>
                                        {/* <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105'></button> */}
                                        <div
                                        className={`mr-4 main flex flex-col gap-2 ${isHovered4 ? '' : 'hidden'}`}
                                        onMouseLeave={() => setIsHovered4(false)}
                                    >
                                        {isHovered4 && ( 
                                            <>
                                            <div className="up flex flex-row gap-2 -mt-3">
                                                <Link href="mailto:bien_aaron_miranda@dlsu.edu.ph" target="_blank" rel="noopener noreferrer">
                                                    <div className="card1 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-c63939">
                                                        <div className="gmail mt-1.5 ml-1.2 fill-current text-white">
                                                        <i className="fa-solid fa-envelope absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://bantaybuddy.vercel.app/user/bienmiranda" target="_blank" rel="noopener noreferrer">
                                                    <div className="card2 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-xanthous">
                                                        <div className="bantaybuddy mt-1.5 ml--0.9 fill-current text-white">
                                                        <i class="fa-solid fa-paw absolute top-1/2 left-7 transform -translate-x-1/2 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="down flex flex-row gap-2 mt-3">
                                                <Link href="https://github.com/Alexxanderson" target="_blank" rel="noopener noreferrer">
                                                    <div className="card3 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-black">
                                                        <div className="github mt--0.6 ml-1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-github absolute top-7 left-1/2 transform -translate-x-1/4 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://linkedin.com/in/bienaaronmiranda/" target="_blank" rel="noopener noreferrer">
                                                    <div className="card4 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-blue-900">
                                                        <div className="linkedin mt--0.6 ml--1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-linkedin absolute top-7 left-7 transform -translate-x-1/2 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            </>
                                        )}
                                        
                                    </div>
                                    
                                    <Image
                                        src={bien}  // Replace this path with the correct path to your image
                                        alt="Bien Miranda"
                                        className={`mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                            isHovered4 ? 'hidden' : ''
                                            }`}
                                            onMouseEnter={() => setIsHovered4(true)}
                                    />
                                        <p className='mr-4 opacity-60'>Bien Miranda</p>
                                    </div>
                                    
                                    <div className='flex flex-col items-center'>
                                    <div
                                        className={`mr-4 main flex flex-col gap-2 ${isHovered5 ? '' : 'hidden'}`}
                                        onMouseLeave={() => setIsHovered5(false)}
                                    >
                                        {isHovered5 && (
                                            <>
                                            <div className="up flex flex-row gap-2 -mt-3">
                                                <Link href="mailto:luis_rana@dlsu.edu.ph" target="_blank" rel="noopener noreferrer">
                                                    <div className="card1 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-c63939">
                                                        <div className="gmail mt-1.5 ml-1.2 fill-current text-white">
                                                        <i className="fa-solid fa-envelope absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://bantaybuddy.vercel.app/user/m_finado" target="_blank" rel="noopener noreferrer">
                                                    <div className="card2 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-xanthous">
                                                        <div className="bantaybuddy mt-1.5 ml--0.9 fill-current text-white">
                                                        <i class="fa-solid fa-paw absolute top-1/2 left-7 transform -translate-x-1/2 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="down flex flex-row gap-2 mt-3">
                                                <Link href="https://github.com/luii-hub" target="_blank" rel="noopener noreferrer">
                                                    <div className="card3 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-black">
                                                        <div className="github mt--0.6 ml-1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-github absolute top-7 left-1/2 transform -translate-x-1/4 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://www.linkedin.com/in/luis-rana-7aab14212/" target="_blank" rel="noopener noreferrer">
                                                    <div className="card4 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-blue-900">
                                                        <div className="linkedin mt--0.6 ml--1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-linkedin absolute top-7 left-7 transform -translate-x-1/2 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            </>
                                        )}
                                        
                                    </div>
                                    
                                    <Image
                                        src={luis}  // Replace this path with the correct path to your image
                                        alt="Luis Rana"
                                        className={`mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                            isHovered5 ? 'hidden' : ''
                                            }`}
                                            onMouseEnter={() => setIsHovered5(true)}
                                    />
                                        <p className='mr-4 opacity-60'>Luis Rana</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Designers */}
                        <div className='flex flex-col items-center mb-8'>
                        <p className='font-shining text-2xl text-grass mt-4'>Designers</p>
                            <div className='flex'>
                                <div className='flex flex-col items-center'>
                                    {/* <button className='mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105' ></button> */}
                                    
                                    <div
                                        className={`mr-4 main flex flex-col gap-2 ${isHovered6 ? '' : 'hidden'}`}
                                        onMouseLeave={() => setIsHovered6(false)}
                                    >
                                        {isHovered6 && (
                                            <>
                                            <div className="up flex flex-row gap-2 -mt-3">
                                                <Link href="mailto:ysobella_torio@dlsu.edu.ph" target="_blank" rel="noopener noreferrer">
                                                    <div className="card1 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-c63939">
                                                        <div className="gmail mt-1.5 ml-1.2 fill-current text-white">
                                                        <i className="fa-solid fa-envelope absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://bantaybuddy.vercel.app/user/bella" target="_blank" rel="noopener noreferrer">
                                                    <div className="card2 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-xanthous">
                                                        <div className="bantaybuddy mt-1.5 ml--0.9 fill-current text-white">
                                                        <i class="fa-solid fa-paw absolute top-1/2 left-7 transform -translate-x-1/2 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="down flex flex-row gap-2 mt-3">
                                                <Link href="https://github.com/ysobella" target="_blank" rel="noopener noreferrer">
                                                    <div className="card3 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-black">
                                                        <div className="github mt--0.6 ml-1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-github absolute top-7 left-1/2 transform -translate-x-1/4 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://linkedin.com/in/ysobella-torio/" target="_blank" rel="noopener noreferrer">
                                                    <div className="card4 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-blue-900">
                                                        <div className="linkedin mt--0.6 ml--1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-linkedin absolute top-7 left-7 transform -translate-x-1/2 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            </>
                                        )}
                                        
                                    </div>
                                    
                                    <Image
                                        src={bella}  // Replace this path with the correct path to your image
                                        alt="Ysobella Torio"
                                        className={`mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                            isHovered6 ? 'hidden' : ''
                                            }`}
                                            onMouseEnter={() => setIsHovered6(true)}
                                    />
                                    {/* <Image
                                        src={bella}  // Replace this path with the correct path to your image
                                        alt="Ysobella Torio"
                                        className="mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform hover:scale-105"
                                    /> */}
                                    <p className='mr-4 opacity-60'>Ysobella Torio</p>
                                </div>
                                
                                <div className='flex flex-col items-center'>
                                <div
                                        className={`mr-4 main flex flex-col gap-2 ${isHovered7 ? '' : 'hidden'}`}
                                        onMouseLeave={() => setIsHovered7(false)}
                                    >
                                        {isHovered7 && (
                                            <>
                                            <div className="up flex flex-row gap-2 -mt-3">
                                                <Link href="mailto:gene_alejo@dlsu.edu.ph" target="_blank" rel="noopener noreferrer">
                                                    <div className="card1 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-c63939">
                                                        <div className="gmail mt-1.5 ml-1.2 fill-current text-white">
                                                        <i className="fa-solid fa-envelope absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://bantaybuddy.vercel.app/user/genecedricalejo" target="_blank" rel="noopener noreferrer">
                                                    <div className="card2 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-xanthous">
                                                        <div className="bantaybuddy mt-1.5 ml--0.9 fill-current text-white">
                                                        <i class="fa-solid fa-paw absolute top-1/2 left-7 transform -translate-x-1/2 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="down flex flex-row gap-2 mt-3">
                                                <Link href="https://github.com/CedricAlejo21" target="_blank" rel="noopener noreferrer">
                                                    <div className="card3 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-black">
                                                        <div className="github mt--0.6 ml-1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-github absolute top-7 left-1/2 transform -translate-x-1/4 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://www.linkedin.com/in/GeneCedricAlejo/" target="_blank" rel="noopener noreferrer">
                                                    <div className="card4 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-blue-900">
                                                        <div className="linkedin mt--0.6 ml--1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-linkedin absolute top-7 left-7 transform -translate-x-1/2 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            </>
                                        )}
                                        
                                    </div>
                                    
                                    <Image
                                        src={cedric}  // Replace this path with the correct path to your image
                                        alt="Cedric Alejo"
                                        className={`mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                            isHovered7 ? 'hidden' : ''
                                            }`}
                                            onMouseEnter={() => setIsHovered7(true)}
                                    />
                                    <p className='mr-4 opacity-60'>Cedric Alejo</p>
                                </div>

                                <div className='flex flex-col items-center'>
                                <div
                                        className={`mr-4 main flex flex-col gap-2 ${isHovered8 ? '' : 'hidden'}`}
                                        onMouseLeave={() => setIsHovered8(false)}
                                    >
                                        {isHovered8 && (
                                            <>
                                            <div className="up flex flex-row gap-2 -mt-3">
                                                <Link href="mailto:rain_david@dlsu.edu.ph" target="_blank" rel="noopener noreferrer">
                                                    <div className="card1 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-c63939">
                                                        <div className="gmail mt-1.5 ml-1.2 fill-current text-white">
                                                        <i className="fa-solid fa-envelope absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://bantaybuddy.vercel.app/user/rcatd" target="_blank" rel="noopener noreferrer">
                                                    <div className="card2 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-xanthous">
                                                        <div className="bantaybuddy mt-1.5 ml--0.9 fill-current text-white">
                                                        <i class="fa-solid fa-paw absolute top-1/2 left-7 transform -translate-x-1/2 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="down flex flex-row gap-2 mt-3">
                                                <Link href="https://github.com/raindavid01" target="_blank" rel="noopener noreferrer">
                                                    <div className="card3 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-black">
                                                        <div className="github mt--0.6 ml-1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-github absolute top-7 left-1/2 transform -translate-x-1/4 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://www.linkedin.com/in/raindavid/" target="_blank" rel="noopener noreferrer">
                                                    <div className="card4 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-blue-900">
                                                        <div className="linkedin mt--0.6 ml--1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-linkedin absolute top-7 left-7 transform -translate-x-1/2 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            </>
                                        )}
                                        
                                    </div>
                                    
                                    <Image
                                        src={rain}  // Replace this path with the correct path to your image
                                        alt="Rain David"
                                        className={`mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                            isHovered8 ? 'hidden' : ''
                                            }`}
                                            onMouseEnter={() => setIsHovered8(true)}
                                    />
                                    <p className='mr-4 opacity-60'>Rain David</p>
                                </div>
                                
                                <div className='flex flex-col items-center'>
                                <div
                                        className={`mr-4 main flex flex-col gap-2 ${isHovered9 ? '' : 'hidden'}`}
                                        onMouseLeave={() => setIsHovered9(false)}
                                    >
                                        {isHovered9 && (
                                            <>
                                            <div className="up flex flex-row gap-2 -mt-3">
                                                <Link href="mailto:kimberly_c_tan@dlsu.edu.ph" target="_blank" rel="noopener noreferrer">
                                                    <div className="card1 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-c63939">
                                                        <div className="gmail mt-1.5 ml-1.2 fill-current text-white">
                                                        <i className="fa-solid fa-envelope absolute top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://bantaybuddy.vercel.app/user/kmmytn" target="_blank" rel="noopener noreferrer">
                                                    <div className="card2 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-xanthous">
                                                        <div className="bantaybuddy mt-1.5 ml--0.9 fill-current text-white">
                                                        <i class="fa-solid fa-paw absolute top-1/2 left-7 transform -translate-x-1/2 -translate-y-1/4"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="down flex flex-row gap-2 mt-3">
                                                <Link href="https://github.com/kmmytn" target="_blank" rel="noopener noreferrer">
                                                    <div className="card3 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-black">
                                                        <div className="github mt--0.6 ml-1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-github absolute top-7 left-1/2 transform -translate-x-1/4 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href="https://www.linkedin.com/in/kimberly-tan-915375278/" target="_blank" rel="noopener noreferrer">
                                                    <div className="card4 w-20 h-20 outline-none border-none bg-white rounded-full transition-transform ease-in-out duration-200 transform hover:scale-110 hover:bg-blue-900">
                                                        <div className="linkedin mt--0.6 ml--1.2 fill-current text-white">
                                                            <i class="fa-solid fa-brands fa-linkedin absolute top-7 left-7 transform -translate-x-1/2 -translate-y-1/2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            </>
                                        )}
                                        
                                    </div>
                                    
                                    <Image
                                        src={kim}  // Replace this path with the correct path to your image
                                        alt="Kimberly Tan"
                                        className={`mr-4 mt-2 w-32 h-32 bg-pistachio rounded-full transition-transform transform ${
                                            isHovered9 ? 'hidden' : ''
                                            }`}
                                            onMouseEnter={() => setIsHovered9(true)}
                                    />
                                    <p className='mr-4 opacity-60'>Kimberly Tan</p>
                                </div>
                            </div>
                        </div>

                        
                    </div>

                    <div className='container mx-auto p-8 text-center flex flex-col items-center w-6/12'>
                        
                        <p class="mb-6">
                            <span class="font-shining text-xl text-grass">BantayBuddy</span> was created in collaboration with Product Owner
                            <a href="https://www.linkedin.com/in/ardy-ubanos/" target="_blank" class="text-grass hover:font-bold"> Mr. Ardy Ubanos </a>
                            as the team's major course output in the Software Engineering (CSSWENG) course at De La Salle University Manila.
                        </p>
                        
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
