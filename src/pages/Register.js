import React, { useState } from 'react'
import Link from 'next/link'
import PostSnippet from '../components/PostSnippet'
import Router from 'next/router'
import { auth, firestore, googleAuthProvider } from '../lib/firebase'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function Register() {

    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ confirm_password, setConfirmPassword ] = useState('')
    const router = Router;

    const handleSignUp = () => {
        if (email === '' || password === '' || confirm_password === '') {
            toast.error('Please fill out all fields')
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

                    // redirect to Login page
                    router.push('/Login')
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
                    toast('Let`s set up you account!', {
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
        <div className='bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center h-full flex flex-col lg:flex-row space-x-20'>

            <div id="login" className='bg-jasmine w-[680px] h-[586px] rounded-[30px] flex flex-col justify-center items-center'>
                <div>
                    <h1 className='text-3xl font-bold'>
                        BantayBuddy Register
                    </h1>
                </div>

                <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className='bg-light_yellow rounded-[30px] mt-3 mb-4 pl-5 p-3 w-[568px] h-[54px] text-2xl font-semibold outline-none' placeholder='Email Address'/>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value.trim())}
                    className='bg-light_yellow rounded-[30px] mb-4 pl-5 p-3 w-[568px] h-[54px] text-2xl font-semibold outline-none' placeholder='Password'/>
                <input 
                    type="password" 
                    value={confirm_password}
                    onChange={(e) => setConfirmPassword(e.target.value.trim())}
                    className='bg-light_yellow rounded-[30px] mb-6 pl-5 p-3 w-[568px] h-[54px] text-2xl font-semibold outline-none' placeholder='Confirm Password'/>
                <button 
                    onClick={handleSignUp}
                    className='bg-xanthous rounded-[30px] pl-5 p-3 w-[568px] h-[54px] text-2xl font-bold text-center hover:opacity-80'>
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
                    Already have an account? <Link href={'/Login'} className='font-bold hover:text-gray-600 text-black'>Log In</Link>
                </div>
            </div>            

            <div 
                id="showcase" 
                className="flex scrollbar-hide overflow-y-scroll justify-center w-[800px] h-[500px]  rounded-[20px]" 
                style={{ scrollSnapType: 'y mandatory' }}
            >
                <div className="flex flex-col">
                    <PostSnippet
                        username='Barker'
                        displayName='barknplay'
                        publish_date='Sept 6 at 4:30 PM'    
                        desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                            Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                            🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                        user_img_src='/images/user1-image.png'
                        post_img_src='/images/post1-image.png'
                        style={{ scrollSnapAlign: 'start' }}/>
                    <PostSnippet
                        username='Barker'
                        displayName='barknplay'
                        publish_date='Sept 6 at 4:30 PM'    
                        desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                            Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                            🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                        user_img_src='/images/user1-image.png'
                        post_img_src='/images/post1-image.png'
                        style={{ scrollSnapAlign: 'start' }}/>
                    <PostSnippet
                        username='Barker'
                        displayName='barknplay'
                        publish_date='Sept 6 at 4:30 PM'    
                        desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                            Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                            🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                        user_img_src='/images/user1-image.png'
                        post_img_src='/images/post1-image.png'
                        style={{ scrollSnapAlign: 'start' }}/>
                </div>
            </div>
        </div>
    )
}
