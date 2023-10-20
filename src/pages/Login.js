import React, { useState } from 'react'
import Link from 'next/link'
import Post from '../components/Post'
import Router from 'next/router'
import { auth, firestore } from '../lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
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

        signInWithEmailAndPassword(auth, email, password)
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
            
    return (
        <div className='bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center h-full flex flex-col lg:flex-row space-x-20'>

            {/* note: still needs responsiveness for mobile, try experimenting with different values using sm, md, and lg until you get desired proportions */}
            <div id="login" className='bg-jasmine w-[680px] h-[586px] rounded-[30px] flex flex-col items-center place-items-start'>
                <div className='mt-[45px] mb-[30px] '>
                    <h1 className='text-3xl font-bold'>
                        Log in
                    </h1>
                </div>
                
                <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=' Email Address'
                    className='bg-light_yellow rounded-[30px] mt-3 mb-3 pl-5 p-3 w-[568px] h-[54px] text-xanthous text-2xl font-semibold'/>
                
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=' Password'
                    className='bg-light_yellow rounded-[30px] mt-3 mb-3 pl-5 p-3 w-[568px] h-[54px] text-xanthous text-2xl font-semibold'/>
                
                <button 
                    onClick={handleLogin}
                    className='bg-xanthous rounded-[30px] mt-8 mb-3 pl-5 p-3 w-[568px] h-[54px] text-2xl font-bold text-center'>
                    Submit
                </button>
                
                <span>
                    {/* TODO: third party sign in auth */}
                </span>

                <div className='text-lg'>Don`t have an account? <Link href={'/Register'} className='font-bold'>Register</Link></div>
            </div>            

            {/* note: still needs responsiveness for mobile, try experimenting with different values using sm, md, and lg until you get desired proportions */}
            <div 
                id="showcase" 
                className="flex scrollbar-hide justify-center w-[880px] h-[544px] overflow-y-scroll rounded-[20px]" 
                style={{ scrollSnapType: 'y mandatory' }}
            >
                <div class="flex flex-col">
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
