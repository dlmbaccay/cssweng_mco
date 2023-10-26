import React, { useState } from 'react'
import Link from 'next/link'
import Post from '../components/Post'
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
            }
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
                    toast('Let`s set up you account!', {
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
    
        auth.sendPasswordResetEmail(auth, email)
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
        <div className='bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center h-full flex flex-col lg:flex-row space-x-20 '>

            <div id="login" className='bg-jasmine w-[680px] h-[586px] rounded-[30px] flex flex-col justify-center items-center place-items-start'>
                <div>
                    <h1 className='text-3xl font-bold mb-3'>
                        BantayBuddy Login
                    </h1>
                </div>
                
                <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    placeholder='Email Address'
                    className='bg-light_yellow rounded-[30px] mt-3 mb-4 pl-5 p-3 w-[568px] h-[54px] text-2xl font-semibold outline-none'/>
                
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value.trim())}
                    placeholder='Password'
                    className='bg-light_yellow rounded-[30px] mb-3 pl-5 p-3 w-[568px] h-[54px] text-2xl font-semibold outline-none'/>
                
                <p 
                    onClick={handleForgotPassword}
                    className='text-md font-semibold cursor-pointer text-gray-600 hover:text-black'>
                    Forgot Password?
                </p>

                <button 
                    onClick={handleLogin}
                    className='bg-xanthous rounded-[30px] mt-6 pl-5 p-3 w-[568px] h-[54px] text-2xl font-bold text-center hover:opacity-80'>
                    Submit
                </button>
                
                <span>
                    {/* google */}
                    <button 
                        onClick={handleGooglePopUp}
                        className='bg-[#FAFAFA] rounded-[30px] mt-4 mb-3 p-3 w-[568px] h-[54px] text-2xl font-bold text-center flex items-center justify-center gap-4 hover:opacity-90'>
                        <p> Continue with </p>
                        <Image src='/images/google.ico' alt='Google Logo' width={30} height={30} />
                    </button>
                </span>

                <div className='text-md'>
                    Don`t have an account?
                    <Link href={'/Register'} className='font-bold hover:text-gray-600 text-black'> Register</Link>
                </div>
            </div>            

            <div 
                id="showcase" 
                className="flex scrollbar-hide overflow-y-scroll justify-center w-[880px] h-[544px]  rounded-[20px]" 
                style={{ scrollSnapType: 'y mandatory' }}
            >
                <div className="flex flex-col">
                    <Post 
                        username='barknplay'
                        publish_date='Sept 6 at 4:30 PM'    
                        desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                            Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                            🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                        user_img_src='/images/user1-image.png'
                        post_img_src='/images/post1-image.png'
                        style={{ scrollSnapAlign: 'start' }}/>
                    <Post
                        style={{ scrollSnapAlign: 'start' }}/>
                    <Post
                        style={{ scrollSnapAlign: 'start' }}/>
                </div>
            </div>
        </div>
    )
}
