import React from 'react'
import Image from 'next/image'

export default function Header( props ) {
    const { username, publish_date, user_img_src } = props;
  return (
    <div>
      <Image
        src= {user_img_src}
        alt="user"
        width={50}
        height={50}
      />
      <p id="username"> {username} </p>
      <p id="publish_date"> {publish_date} </p>
    </div>
  )
}
