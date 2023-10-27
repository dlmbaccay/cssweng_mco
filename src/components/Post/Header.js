import React from 'react'
import Image from 'next/image'
import RoundIcon from '../RoundIcon';

export default function Header( props ) {
    const { username, publish_date, user_img_src } = props;
  return (
    <div className='flex flex-row'>
      <div className='w-16 h-16'>
      <RoundIcon
        src= {user_img_src}
        alt="user"
      />
      </div>
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
