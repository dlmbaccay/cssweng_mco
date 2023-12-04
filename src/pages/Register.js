import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { auth, firestore, googleAuthProvider } from '../lib/firebase'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { checkPassword } from '../lib/formats'

// About Us
import anne from '/public/images/team/SULIT.jpg'
import andre from '/public/images/team/AQUINO.jpg'
import doms from '/public/images/team/BACCAY.jpg'
import bella from '/public/images/team/Ysobella_Torio.jpg'
import luis from '/public/images/team/RANA.jpg'
import bien from '/public/images/team/Miranda_Bien.jpg'
import cedric from '/public/images/team/ALEJO.jpg'
import rain from '/public/images/team/DAVID.png'
import kim from '/public/images/team/TAN.jpg'
import { useRef } from 'react';

export default function Register() {

    const scrollToRef = (ref) => {
        window.scrollTo({
          top: ref.current.offsetTop,
          behavior: 'smooth',
        });
    };

    // About Us      
    const aboutUsRef = useRef(null);
    
    const handleButtonClick = () => {
        scrollToRef(aboutUsRef);
    };

    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ confirm_password, setConfirmPassword ] = useState('')
    const router = Router;

    const handleSignUp = () => {
        if (email === '' || password === '' || confirm_password === '') {
            toast.error('Please fill out all fields')
            return
        } else if (!checkPassword(password)){
            toast.error('Password is not secure.')
            return
        } else if (password !== confirm_password) {
            toast.error('Passwords do not match')
            return
        } else {
            auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user
                console.log(user)
                
                // clear fields
                setEmail('')
                setPassword('')
                setConfirmPassword('')

                // send email verification 
                auth.currentUser.sendEmailVerification().then(() => {
                    toast.success('Check your email to verify your account')
                }).catch((error) => {
                    console.log(error)
                });

                // sign out the user
                auth.signOut()
                .then(() => {
                // redirect to Login page
                router.push('/Login');
                })
                .catch((error) => {
                console.log(error);
                });
            })
            .catch((error) => {
                const errorMessage = error.message
                toast.error(errorMessage)
            })
        }
    }

    async function handleGooglePopUp() {
        await auth.signInWithPopup(googleAuthProvider).then((result) => {
            // Signed in 
            const user = result.user;

            // Check if email is verified
            if (!user.emailVerified) {
                toast.error('Please verify your email before logging in');
                return;
            } 
            
            return user;
        }).then((user) => {
            // Fetch the username from Firestore
            const ref = firestore.collection('users').doc(user.uid);

            ref.get().then((doc) => {
                const username = doc.data()?.username;

                if (!username) {
                    // If email is verified but no username, redirect to AccountSetup
                    toast('Let`s set up your account!', {
                        icon: '👏',
                    });
                    router.push('/AccountSetup');
                } else {
                    // If old user (email verified and has username), redirect to Home

                    // Clear fields
                    setEmail('');
                    setPassword('');

                    toast('Welcome back', {
                        icon: '👏',
                    });
                    // Redirect to Home page
                    router.push('/Home');
                }
            });
        })
        .catch((error) => {
            const errorMessage = error.message
            toast.error(errorMessage)
        })
    }

    return (
        <div>
            <div className='h-screen bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] flex flex-col justify-center items-center 
                lg:flex-row lg:gap-32
                max-md:gap-20 
                max-sm:gap-5 max-sm:p-4'>

                <div id="login" className='bg-jasmine drop-shadow-md w-[300px] h-[500px] md:w-[500px] md:h-[500px] rounded-3xl flex md:pl-12 md:pr-12 pl-8 pr-8 flex-col justify-center items-center'>
                    <div>
                        <h1 className='md:text-6xl text-[44px] font-bold font-shining md:mb-4 mb-1 text-grass cursor-pointer'  onClick={handleButtonClick}>BantayBuddy</h1>
                    </div>

                    <input 
                        type="text" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value.trim())}
                        className='bg-light_yellow rounded-xl mt-3 p-4 w-full h-12 md:text-lg font-semibold outline-none' placeholder='Email Address'/>
                    <div className='relative w-[100%] justify-evenly items-center flex flex-col lg:flex-row'>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value.trim())}
                            className={`md:hover-tooltip bg-light_yellow rounded-xl mt-3 p-4 w-full h-12 md:text-lg font-semibold outline-none ${password === '' ? '': !checkPassword(password) ? 'border border-red-500' : 'border border-green-500'}`} placeholder='Password'/>
                        
                        <div className="tooltip hidden bg-gray-800 drop-shadow-sm text-white text-xs rounded p-1 absolute top-0 right-full transform -translate-x-4 -translate-y-5 tracking-wide">
                            <p className='text-sm text-slate-700'>Password must:</p>
                            <ul className="list-none pl-2">
                                <li className='text-xs text-slate-600'>
                                    <span className={`bullet ${/^.{8,16}$/.test(password) ? 'bg-green-500':'bg-slate-300'}`}>
                                    </span>be 8-16 characters long.</li>
                                <li className='text-xs text-slate-600'>
                                    <span className={`bullet ${/[A-Z]/.test(password) ? 'bg-green-500':'bg-slate-300'}`}>
                                    </span>contain at least one uppercase letter.</li>
                                <li className='text-xs text-slate-600'>
                                    <span className={`bullet ${/[a-z]/.test(password) ? 'bg-green-500':'bg-slate-300'}`}>
                                    </span>contain at least one lowercase letter.</li>
                                <li className='text-xs text-slate-600'>
                                    <span className={`bullet ${/[0-9]/.test(password) ? 'bg-green-500':'bg-slate-300'}`}>
                                    </span>contain at least one digit.</li>
                                <li className='text-xs text-slate-600'>
                                    <span className={`bullet ${/\W/.test(password) ? 'bg-green-500':'bg-slate-300'}`}>
                                    </span>contain at least one special character.</li>
                            </ul>
                        </div>
                    </div>
                    
                    <input 
                        type="password" 
                        value={confirm_password}
                        onChange={(e) => setConfirmPassword(e.target.value.trim())}
                        className='bg-light_yellow rounded-xl mt-3 mb-4 p-4 w-full h-12 md:text-lg font-semibold outline-none' placeholder='Confirm Password'/>

                    <button 
                        onClick={handleSignUp}
                        className='bg-xanthous rounded-xl mt-4 mb-3 w-full h-12 md:text-lg font-bold  outline-none hover:bg-light_yellow transition-all'>
                        Register
                    </button>

                    <span className='w-full'>
                        {/* google */}
                        <button 
                            onClick={handleGooglePopUp}
                            className='bg-snow rounded-xl mb-3 w-full h-12 md:text-lg font-bold text-center flex items-center justify-center gap-2 hover:bg-light_yellow transition-all'>
                            <p> Continue with </p>
                            <Image src='/images/google.ico' alt='Google Logo' width={20} height={20} />
                        </button>
                    </span>

                    <div className='text-xs md:text-sm'>
                        Already have an account? <Link href={'/Login'} className='font-bold hover:text-grass transition-all text-black'>Log In</Link>
                    </div>
                </div>            

                <div id="showcase" className="hidden lg:flex justify-center w-fit h-fit rounded-lg drop-shadow-md">
                    <PostShowcase />
                </div>

                <div className='fixed bottom-4 right-4 z-10' onClick={handleButtonClick}>
                    <div className='flex flex-row justify-center items-center gap-2 mr-8 transition-transform transform hover:scale-105'>
                        <h1 className='font-shining text-3xl text-grass'>BantayBuddy</h1>

                        <div className='bg-grass w-[40px] h-[40px] rounded-full shadow-lg'>
                        <Image src='/images/logo.png' alt='logo' width={100} height={100} className='rounded-full'/>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex flex-row w-full h-screen overflow-hidden' ref={aboutUsRef}>
                <AboutUs />
            </div>
        </div>
    )
}

function PostShowcase() {

    const authorDisplayName = 'Pooch';
    const authorUsername = 'pawsomepooch';
    const authorPhotoURL = '/images/sample-user2-image.png';
    const postDate = '31/11/6 at 21:00';
    const postBody = 'Whisker Wonderland! 🐾🌿 Playtime in the park with our curious cats. Watching them explore and frolic is pure joy! #CatsofthePark #PurrfectDay';
    const imageUrls = ['/images/sample-user2-post.png'];

    return (
        <div className='shadow-sm bg-snow w-[650px] h-fit rounded-3xl p-6 flex flex-col'>
            {/* Header */}
            <div id="post-header" className='flex flex-row'>

              <div className='flex flex-row'>
                {/* User Image */}
                <div id="user-image">
                  <Image width={50} height={50} src={authorPhotoURL} alt="user image" className='rounded-full shadow-md'/>
                </div>

                <div id='post-meta' className='ml-4 h-full items-center justify-center'>
                    <div id='user-meta' className='flex flex-row gap-2 '>
                      {/* Display Name */}
                      <div id='display-name' className='font-bold'>
                        <p>{authorDisplayName}</p>
                      </div>

                      <div className='font-bold'>
                        ·
                      </div>

                      {/* Username */}
                      <div id='display-name'>
                        <p>@{authorUsername}</p>
                      </div>
                    </div>
      
                    {/* Publish Date */}
                    <div id='publish-date'>
                      <p>{postDate}</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div id='post-body' className='mt-4 flex flex-col'>
              <div id='post-text'>
                <p className='whitespace-pre-line text-justify'>{postBody}</p>
              </div>
              
              {/* Image Carousel */}
              <div id="post-image" className='mt-4 h-[310px] w-auto flex items-center justify-center relative'>
                <Image src={imageUrls[0]} alt="post image" 
                  layout='fill'
                  objectFit='cover'
                  className='rounded-lg'
                  />
              </div>
            </div>
        </div>
    )
}

function AboutUs(){
    // About Us
    const [isHovered1, setIsHovered1] = useState(false);
    const [isHovered2, setIsHovered2] = useState(false);
    const [isHovered3, setIsHovered3] = useState(false);
    const [isHovered4, setIsHovered4] = useState(false);
    const [isHovered5, setIsHovered5] = useState(false);
    const [isHovered6, setIsHovered6] = useState(false);
    const [isHovered7, setIsHovered7] = useState(false);
    const [isHovered8, setIsHovered8] = useState(false);
    const [isHovered9, setIsHovered9] = useState(false);

    const handleLoginButtonClick = () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      };

    return(
        
        <div className='h-full w-full overflow-auto flex flex-col justify-start items-center pt-5 pb-5 bg-jasmine'>
                <h1 className='text-raisin_black text-4xl mb-5 mt-5 font-shining'>Meet the Team!</h1>

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

                    <div className='flex flex-col md:flex-row'>
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
                                            <Link href="https://bantaybuddy.vercel.app/user/dlmbaccay" target="_blank" rel="noopener noreferrer">
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
                    <div className='flex flex-col items-center mb-6'>
                    <p className='font-shining text-2xl text-grass mt-4'>Designers</p>
                        <div className='flex flex-col md:flex-row'>
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
                            </div>

                            <div className='flex'>
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
                </div>

                <div className={`container mx-auto pl-6 pr-6 mb-6 text-center flex flex-col items-center w-6/12 `}>
                    
                    <p>
                        <span class="font-shining text-xl text-grass">BantayBuddy</span> was created in collaboration with Product Owner
                        <a href="https://www.linkedin.com/in/ardy-ubanos/" target="_blank" class="text-grass hover:font-bold"> Mr. Ardy Ubanos </a>
                        as the team&apos;s major course output in the Software Engineering (CSSWENG) course at De La Salle University Manila.
                    </p>
                    
                </div>

                
                    <div onClick={handleLoginButtonClick} className='mb-16 md:mb-4'>
                        <button className='font-shining text-2xl bg-grass text-snow px-4 py-2 rounded-lg hover:bg-black transition-all'>
                            Scroll to Top
                        </button>
                    </div>
                

                
                
            </div>
    )
}