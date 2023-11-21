import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { auth, firestore, googleAuthProvider } from '../lib/firebase'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { checkPassword } from '../lib/formats'

export default function Register() {

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
        <div className='
            h-screen
            bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] 
            flex flex-col justify-center items-center 
            lg:flex-row lg:gap-32'>

            <div id="login" className='bg-jasmine drop-shadow-md w-[500px] h-[500px] rounded-3xl pl-12 pr-12 flex flex-col justify-center items-center'>
                <div>
                    <h1 className='text-6xl font-bold font-shining mb-4 text-grass'>BantayBuddy</h1>
                </div>

                <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className='bg-light_yellow rounded-xl mt-3 p-4 w-full h-12 text-lg font-semibold outline-none' placeholder='Email Address'/>
                <div className='relative w-[100%] justify-evenly items-center flex flex-col lg:flex-row'>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value.trim())}
                        className={`hover-tooltip bg-light_yellow rounded-xl mt-3 p-4 w-full h-12 text-lg font-semibold outline-none ${password === '' ? '': !checkPassword(password) ? 'border border-red-500' : 'border border-green-500'}`} placeholder='Password'/>
                    
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
                    className='bg-light_yellow rounded-xl mt-3 mb-4 p-4 w-full h-12 text-lg font-semibold outline-none' placeholder='Confirm Password'/>

                <button 
                    onClick={handleSignUp}
                    className='bg-xanthous rounded-xl mt-4 mb-3 w-full h-12 text-lg font-bold  outline-none hover:bg-light_yellow transition-all'>
                    Register
                </button>

                <span className='w-full'>
                    {/* google */}
                    <button 
                        onClick={handleGooglePopUp}
                        className='bg-snow rounded-xl mb-3 w-full h-12 text-lg font-bold text-center flex items-center justify-center gap-2 hover:bg-light_yellow transition-all'>
                        <p> Continue with </p>
                        <Image src='/images/google.ico' alt='Google Logo' width={20} height={20} />
                    </button>
                </span>

                <div className='text-sm'>
                    Already have an account? <Link href={'/Login'} className='font-bold hover:text-gray-600 text-black'>Log In</Link>
                </div>
            </div>            

            <div id="showcase" className="hidden lg:flex justify-center w-fit h-fit rounded-lg drop-shadow-md">
                <PostShowcase />
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