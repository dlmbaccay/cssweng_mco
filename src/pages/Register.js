import React, { useState } from 'react'
import Link from 'next/link'
import Post from '../components/Post'
import Router from 'next/router'
import { auth } from '../../lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export default function Register() {

    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ confirm_password, setConfirmPassword ] = useState('')
    const [ error, setError ] = useState('')
    const router = Router;

    const handleSignUp = () => {
        if (email === '' || password === '' || confirm_password === '') {
            setError('Please fill out all fields')
            return
        } else if (password !== confirm_password) {
            setError('Passwords do not match')
            return
        } else {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user
                    console.log(user)
                    
                    // clear fields
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')

                    // redirect to Login page
                    router.push('/Login')
                    // ...
                })
                .catch((error) => {
                    const errorCode = error.code
                    const errorMessage = error.message
                    console.log(errorCode)
                    console.log(errorMessage)
                    setError(errorMessage)
                    // ..
                })
        }
    }

    return (
        <div className='bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center h-full flex flex-col lg:flex-row space-x-20'>

            {/* note: still needs responsiveness for mobile, try experimenting with different values using sm, md, and lg until you get desired proportions */}
            <div id="login" className='bg-jasmine w-[680px] h-[586px] rounded-[30px] '>
                <h1>Register</h1>

                <div> 
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="text" 
                        placeholder='Email Address' /> 
                </div>
               
                <div> 
                    <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password" 
                        placeholder='Password' /> 
                </div>
               
                <div> 
                    <input 
                        value={confirm_password}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password" 
                        placeholder='Password' /> 
                </div>

                <div> {error} </div>
                <div> <button onClick={handleSignUp}>Submit</button> </div>

                <div>Already have an account? <Link href={'/Login'}>Log In</Link></div>
            </div>            

            {/* note: still needs responsiveness for mobile, try experimenting with different values using sm, md, and lg until you get desired proportions */}
            <div 
                id="showcase" 
                className="flex scrollbar-hide justify-center w-[880px] h-[544px] overflow-y-scroll rounded-[20px]" 
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
