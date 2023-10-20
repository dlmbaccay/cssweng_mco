import React from 'react'
import Image from 'next/image';

export default function Body( props ) {

  const { desc, post_img_src } = props;

  return (
    <div>
      <p id="desc"
         className='text-sm mt-2 mb-2'> 
        {desc} 
      </p>
      <div className="relative w-full h-full">
        <Image
          src={post_img_src}
          alt="post"
          width={850}
          height={300}
        />
      </div>
      {/* <Image
        src= {post_img_src}
        alt="post"
        width={800}
        height={300}
        className='absolute w-full h-full object-cover'
      /> */}
    </div>
  )
}