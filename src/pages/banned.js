import React from 'react'
import Image from 'next/image';
import Router from 'next/router';

export default function BanPage() {
    const router = Router;
  return (
    <div class="flex lg:flex-row max-sm:flex-col h-screen px-4 bg-snow justify-center items-center lg:gap-10 max-sm:gap-0">
      <Image src='/images/error.png' alt='error' width={300} height={300} className='max-sm:h-72 max-sm:w-auto'/>
      <div className='mt-20 max-sm:text-center max-sm:mt-3'>
          <h1 class="font-black text-gray-200 text-9xl max-sm:text-5xl">Banned</h1>
          <p class="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">Oops!</p>
          <p class="mt-4 max-sm:mt-2 text-raisin_black">You have multiple violations.</p>
          <button class="w-fit px-5 py-3 mt-6 max-sm:mt-3 text-shining text-sm font-medium text-white   bg-grass rounded-md hover:bg-[#3C5D1A] transition-all focus:outline-none focus:ring"
                  onClick={() => router.push('/')}>Go back to Login</button>
      </div>
        
    </div>
  )
}