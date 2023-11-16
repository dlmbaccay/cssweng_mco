import React, { useState } from 'react'
import Link from 'next/link'
import PostSnippet from '../components/PostSnippet'
import Image from 'next/image'
import Router from 'next/router'
import { auth, firestore, googleAuthProvider } from '../lib/firebase'
import toast from 'react-hot-toast'

export default function Login() {

    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const router = Router;

    const handleLogin = () => {
        if (email === '' || password === '') {
            toast.error('Please fill out all fields')
            return
        }

        auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;

            // Check if email is verified
            if (!user.emailVerified) {
                toast.error('Please verify your email before logging in');
                return;
            } 

            return user;
        })
        .then((user) => {
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
            const errorCode = error.code
            const errorMessage = error.message
            console.log(errorCode)
            console.log(errorMessage)

            if (errorCode === 'auth/invalid-login-credentials') {
                toast.error('Wrong email or password!')
                return
            } else if (errorCode === 'auth/too-many-requests') {
                toast.error('Too many attempts. Try again later or reset your password.')
                return
            }
            toast.error('Wrong email or password!')
        })  
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

                    toast('Welcome back', {
                        icon: '👏',
                    });
                    // Redirect to Home page
                    router.push('/Home');
                }
            });
        })
        .catch((error) => {
            const errorCode = error.code

            if (errorCode === 'auth/invalid-login-credentials') {
                toast.error('Wrong email or password!')
                return
            }
        })
    }

    const handleForgotPassword = () => {
        if(email === '') {
            toast.error("Please enter an email address");
            return;
        }
    
        auth.sendPasswordResetEmail(email)
        .then(() => {
            // Password reset email sent!
            toast.success("A password reset email has been sent!");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            // Handle the different types of errors
            if (errorCode === 'auth/invalid-email') {
                toast.error('Invalid email address.');
            } else {
                toast.error(errorMessage);
            }
        });
    }
            
    return (
        <div className='bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] h-screen justify-evenly items-center flex flex-col lg:flex-row '>

            <div id="login" className='bg-jasmine w-[500px] h-[500px] rounded-3xl flex pl-12 pr-12 flex-col justify-center items-center'>

                <h1 className='text-6xl font-bold font-shining mb-4 text-grass'>BantayBuddy</h1>
                
                <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    placeholder='Email Address'
                    className='bg-light_yellow rounded-xl mt-3 p-4 w-full h-12 text-lg font-semibold outline-none' />
                
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value.trim())}
                    placeholder='Password'
                    className='bg-light_yellow rounded-xl mt-3 mb-3 p-4 w-full h-12 text-lg font-semibold outline-none' />
                
                <p 
                    onClick={handleForgotPassword}
                    className='text-sm font-semibold cursor-pointer text-gray-600 hover:text-black mb-3'>
                    Forgot Password?
                </p>

                <button 
                    onClick={handleLogin}
                    className='bg-xanthous rounded-xl mt-3 mb-3 w-full h-12 text-lg font-bold  outline-none hover:bg-light_yellow transition-all'>
                    Log In
                </button>
                
                <span className='w-full'>
                    {/* google */}
                    <button 
                        onClick={handleGooglePopUp}
                        className='bg-snow rounded-xl mb-3 w-full h-12 text-lg font-bold text-center flex items-center justify-center gap-2 hover:bg-light_yellow transition-all'>
                        <p>Continue with </p>
                        <Image src='/images/google.ico' alt='Google Logo' width={20} height={20} />
                    </button>
                </span>

                <div className='text-sm'>
                    Don`t have an account?
                    <Link href={'/Register'} className='font-bold hover:text-gray-600 text-black'> Register</Link>
                </div>
            </div>            

            <div 
                id="showcase" 
                className="flex justify-center w-fit h-fit rounded-lg" 
            >
                <div className="flex flex-col">
                    <PostSnippet
                        props={{
                            currentUserID: '123',
                            postID: '123',
                            postBody: 'Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.',
                            postDate: '23/9/6 at 16:30',
                            imageUrls: ['/images/post1-image.png'],
                            authorID: '123',
                            authorDisplayName: 'Barker',
                            authorUsername: 'barknplay',
                            authorPhotoURL: '/images/user1-image.png',
                            likes: [],
                            comments: [],
                        }} 
                    />
                </div>
            </div>
        </div>
    )
}
