import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import PostSnippet from '../components/PostSnippet'
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
        <div className='bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] h-screen justify-evenly items-center flex flex-col lg:flex-row'>

            <div id="login" className='bg-jasmine w-[600px] h-[500px] rounded-3xl flex flex-col justify-center items-center'>
                <div>
                    <h1 className='text-3xl font-bold mb-3'>
                        BantayBuddy Register
                    </h1>
                </div>

                <input 
                    type="text" 
                    value={email}
                    pattern="^\S+$"
                    onChange={(e) => setEmail(e.target.value)}
                    className='bg-light_yellow rounded-xl mt-3 p-4 w-[90%] h-12 text-lg font-semibold outline-none' placeholder='Email Address'/>
                <div className='relative w-[100%] justify-evenly items-center flex flex-col lg:flex-row'>
                    <input 
                        type="password" 
                        value={password}
                        pattern="^\S+$"
                        onChange={(e) => setPassword(e.target.value)}
                        className={`hover-tooltip bg-light_yellow rounded-xl mt-3 p-4 w-[90%] h-12 text-lg font-semibold outline-none ${password === '' ? '': !checkPassword(password) ? 'border border-red-500' : 'border border-green-500'}`} placeholder='Password'/>
                    <div class="tooltip hidden bg-gray-800 text-white text-sm rounded p-1 absolute top-0 left-full transform -translate-x-3 translate-y-1">
                        <p>Password must:</p>
                        <ul className="list-disc pl-4">
                            <li>be 8-16 characters long.</li>
                            <li>contain at least one uppercase letter.</li>
                            <li>contain at least one lowercase letter.</li>
                            <li>contain at least one digit.</li>
                            <li>contain at least one special character.</li>
                        </ul>
                    </div>
                </div>
                
                <input 
                    type="password" 
                    pattern="^\S+$"
                    value={confirm_password}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='bg-light_yellow rounded-xl mt-3 mb-4 p-4 w-[90%] h-12 text-lg font-semibold outline-none' placeholder='Confirm Password'/>

                <button 
                    onClick={handleSignUp}
                    className='bg-xanthous rounded-xl mt-4 mb-3 w-[90%] h-12 text-lg font-bold  outline-none hover:bg-light_yellow transition-all'>
                    Submit
                </button>

                <span className='w-[90%]'>
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

            <div 
                id="showcase" 
                className="flex scrollbar-hide overflow-y-scroll justify-center w-[800px] h-[500px]  rounded-[20px]" 
                style={{ scrollSnapType: 'y mandatory' }}
            >
                <div className="flex flex-col">
                    <PostSnippet
                        username='barknplay'
                        displayName='Barker'
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
