import React from 'react'
import Image from 'next/image';

export default function Body( props ) {

  const { desc, post_img_src } = props;

  return (
    <div>
      
      <p id="desc"> {desc} </p>
      <Image
        src= {post_img_src}
        alt="post"
        width={700}
        height={300}
      />

    </div>
  )
}
