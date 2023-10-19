import React, { useState } from 'react'
import Link from 'next/link'
import Post from '../components/Post'
import Router from 'next/router'
import { auth } from '../lib/firebase'
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
        // Check if the user's email is verified
        const user = userCredential.user

        if (!user.emailVerified) {
            toast.error('Please verify your email before logging in')
            return
        }

        // Signed in 
        console.log(user)
        
        // Clear fields
        setEmail('')
        setPassword('')

        // Redirect to Login page
        // router.push('/Home')
        // ...
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
            <div id="login" className='bg-jasmine w-[680px] h-[586px] rounded-[30px] '>
                <h1>Log In</h1>

                <div> 
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="text" 
                        placeholder=' Email Address' /> 
                </div>
               
                <div> 
                    <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password" 
                        placeholder=' Password' /> 
                </div>

                <div> <button onClick={handleLogin}>Submit</button> </div>

                <div>Don`t have an account? <Link href={'/Register'}>Register</Link></div>
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
