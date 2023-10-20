import React from 'react'
import Header from './Header'
import Body from './Body'
import Footer from './Footer'

export default function Post( props ) {

    // since we dont have a proper database yet, use hardcoded props for now
    // make sure to put all images in public/images
    // ill make one post to demo how to pass props into the other components in this file (note i will input the 'props' from Login.js)
    // then you can add more posts
    // for the user image, and post image, just directly link them from public/images using Image for now

    const { username, publish_date, desc, user_img_src, post_img_src } = props;

    return (
      <div className='bg-snow w-[859px] h-[544px] rounded-[20px] flex-none snap-start p-[25px] relative'>
          <Header username={username} publish_date={publish_date} user_img_src={user_img_src}/>
          <Body desc={desc} post_img_src={post_img_src}/>
          <Footer/>
      </div>
    )
}
