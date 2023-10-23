import React, { useState } from 'react'
import Link from 'next/link'
import Post from '../components/Post'

export default function Login() {

    return (
        <div className='bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center h-full flex flex-col space-y-10 p-10
                        lg:flex-row lg:space-x-20 lg:py-10
                        md:space-x-14 md:py-10
                        sm:space-x-10 sm:py-10'>
            {/* note: still needs responsiveness for mobile, try experimenting with different values using sm, md, and lg until you get desired proportions */}
            <div id="login" 
                 className='bg-jasmine w-full h-[586px] rounded-[30px] flex flex-col justify-center items-center space-y-5 p-10
                              md:w-[680px] md:p-10 transition-all sm:h-fit'>
                <div>
                    <h1 className='text-3xl font-bold text-center'>
                        Log in
                    </h1>
                </div>
                {/* <input type="text" className='bg-light_yellow rounded-[30px] mt-3 mb-3 pl-5 p-3 w-[568px] h-[54px] text-xanthous text-2xl font-semibold' placeholder='Username'/>
                <input type="password" className='bg-light_yellow rounded-[30px] mt-3 mb-3 pl-5 p-3 w-[568px] h-[54px] text-xanthous text-2xl font-semibold' placeholder='Password'/>
                <button className='bg-xanthous rounded-[30px] mt-8 mb-3 pl-5 p-3 w-[568px] h-[54px] text-2xl font-bold text-center'>
                    Submit
                </button>
                
                <span>

                    TODO: third party sign in auth 
                </span> */}
                <form className='flex flex-col  items-center w-full'>
                    <input className='bg-light_yellow rounded-[30px] mt-3 mb-3 pl-5 p-3 w-full h-[54px] placeholder-xanthous text-2xl font-semibold space-y-5 focus:outline-transparent'
                           id='username'
                           placeholder='Email Address'/>
                    
                    <input className='bg-light_yellow rounded-[30px] mt-3 mb-3 pl-5 p-3 w-full h-[54px] placeholder-xanthous text-2xl font-semibold space-y-5 focus:outline-transparent'
                           id='passsword'
                           placeholder='Password'/>

                    <button
                        className='bg-xanthous rounded-[30px] mt-3 mb-3 pl-5 p-3 w-full h-[54px] text-2xl font-bold text-center'
                        type='button'>
                        Log in
                    </button>
                </form>
                <p>Or log in with</p>

                <div className='text-lg'>Don`t have an account? <Link href={'/Register'} className='font-bold'>Register</Link></div>
            </div>            

            {/* note: still needs responsiveness for mobile, try experimenting with different values using sm, md, and lg until you get desired proportions */}
            <div 
                id="showcase" 
                className="flex scrollbar-hide justify-center w-full max-w-[859px]  overflow-y-scroll rounded-[20px]"
                style={{ scrollSnapType: 'y mandatory' }}
            >
                <div class="flex flex-col h-fit max-h-[510px]">
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
                        username='barknplay'
                        publish_date='Sept 6 at 4:30 PM'    
                        desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                            Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                            🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                        user_img_src='/images/user1-image.png'
                        post_img_src='/images/post1-image.png'
                        style={{ scrollSnapAlign: 'start' }}/>
                    <Post
                        username='barknplay'
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
