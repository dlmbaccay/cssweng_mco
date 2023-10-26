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
        <div className="max-w-[850px] min-h-[300px] max-h-[300px] object-cover my-3">
          <Image
            src={post_img_src}
            alt="post"
            width={850}
            height={300}
            className="min-h-[300px] max-h-[300px] object-cover my-3"
          />
        </div>
      </div>
    </div>
  )
}