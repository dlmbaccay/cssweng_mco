import React, { useState } from 'react'
import Link from 'next/link'
import Post from '../components/Post'

export default function Login() {

    return (
        <div className='bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center h-full flex flex-col lg:flex-row space-x-20'>

            {/* note: still needs responsiveness for mobile, try experimenting with different values using sm, md, and lg until you get desired proportions */}
            <div id="login" className='bg-jasmine w-[680px] h-[586px] rounded-[30px] flex flex-col items-center place-items-start'>
                <div className='mt-[45px] mb-[30px] '>
                    <h1 className='text-3xl font-bold'>
                        Log in
                    </h1>
                </div>
                <span className='bg-light_yellow rounded-[30px] mt-3 mb-3 pl-5 p-3 w-[568px] h-[54px] text-xanthous text-2xl font-semibold'>
                    Username
                </span>
                <span className='bg-light_yellow rounded-[30px] mt-3 mb-3 pl-5 p-3 w-[568px] h-[54px] text-xanthous text-2xl font-semibold'>
                    Password
                </span>
                <span className='bg-xanthous rounded-[30px] mt-8 mb-3 pl-5 p-3 w-[568px] h-[54px] text-2xl font-bold text-center'>
                    Log in
                </span>
                <p className='text-lg'>Or log in with</p>  
                <span>
                    
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
