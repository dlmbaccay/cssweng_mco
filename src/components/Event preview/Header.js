import React from 'react'
import Image from 'next/image'

export default function Header( props ) {
    const { username, publish_date, user_img_src } = props;
  return (
    <div className='flex flex-row'>
      <Image
        src= {user_img_src}
        alt="user"
        width={65}
        height={65}
        className='rounded-[40px]'
      />
      <div className='ml-5 mt-3 text-sm md:text-base'> {/* text content */}
        <p id="username"
           className='font-bold text-lg md:text-xl'> 
          {username} 
        </p>
        <p id="publish_date"
           className='text-xs md:text-sm'> 
          {publish_date} 
        </p>
      </div>
      
    </div>
  )
}
