import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'



import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/laugh.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'



export default function Post( props ) {

    const { username, displayName, publish_date, desc, user_img_src, post_img_src } = props;
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);


    const handleHeartHover = () => {
      setIsOverlayVisible(true);
    };

    const handleHeartLeave = () => {
      setIsOverlayVisible(false);
    };

    const handleOverlayHover = () => {
      setIsOverlayVisible(true);
      
    };
  
    const handleOverlayLeave = () => {
      setIsOverlayVisible(false);
    };

    return (
      <div className='shadow-sm hover:shadow-lg bg-snow w-[800px] h-[500px] rounded-3xl p-6 flex flex-col'>
        {/* Header */}
        <div id="post-header" className='flex flex-row'>

          {/* User Image */}
          <div id="user-image">
            <Image width={50} height={50} src={user_img_src} alt="user image" className='rounded-full shadow-md'/>
          </div>

          <div id='post-meta' className='ml-4 h-full items-center justify-center'>
              <div id='user-meta' className='flex flex-row gap-2 '>
                {/* Display Name */}
                <div id='display-name' className='font-bold'>
                  <p>{displayName}</p>
                </div>

                <div className='font-bold'>
                  ·
                </div>

                {/* Display Name */}
                <Link href={'/user/' + username} id='display-name' className='hover:text-grass hover:font-semibold transition-all'>
                  <p>@{username}</p>
                </Link>
              </div>
 
              {/* Publish Date */}
              <div id='publish-date'>
                <p>{publish_date}</p>
              </div>
          </div>
        </div>

        {/* Body */}
        <div id='post-body' className='mt-4 flex flex-col'>
          <div id='post-text'>
            <p>{desc}</p>
          </div>
          
          <div id="post-image" className='mt-4 h-full w-full flex items-center justify-center'>
            <Image width={600} height={300} src={post_img_src} alt="post image" className='rounded-lg'/>
          </div>
        </div>

        {/* Footer */}
        <div id='post-footer' className='mt-4 flex flex-row w-full justify-between relative'>
          {isOverlayVisible && (
              <div id='overlay' className='absolute bottom-5 left-0' 
              onMouseEnter={handleOverlayHover}
              onMouseLeave={handleOverlayLeave}>
                <div className='flex flex-row gap-2 w-[250px] h-[50px] bg-snow rounded-3xl drop-shadow-xl'>
                  <div className='w-100 h-100 mt-2 hover:scale-125 hover:transform'>
                    <Image src={likeReaction} alt="like reaction" />
                  </div>
                  <div className='w-100 h-100 mt-2 hover:scale-125 hover:transform'>
                    <Image src={heartReaction} alt="like reaction" />
                  </div>
                  <div className='w-100 h-100 mt-1 hover:scale-125 hover:transform'>
                    <Image src={laughReaction} alt="like reaction" />
                  </div>
                  <div className='w-100 h-100 mt-1 hover:scale-125 hover:transform'>
                    <Image src={wowReaction} alt="like reaction" />
                  </div>
                  <div className='w-100 h-100 mt-2 hover:scale-125 hover:transform'>
                    <Image src={sadReaction} alt="like reaction" />
                  </div>
                  <div className='w-100 h-100 mt-2 hover:scale-125 hover:transform'>
                    <Image src={angryReaction} alt="like reaction" />
                  </div>
                </div>
              </div>
            )}
          <div id="left" className='flex flex-row gap-4'>
            <div id='post-reaction-control' className='flex flex-row justify-center items-center gap-2'>
              <i className="fa-solid fa-heart hover:text-grass hover:scale- hover:cursor-pointer" 
              onMouseEnter={handleHeartHover}
              onMouseLeave={handleHeartLeave}></i>
              <p>0</p>
            </div>
            
            <div id="comment-control" className='flex flex-row justify-center items-center gap-2'>
              <i className="fa-solid fa-comment hover:text-grass hover:scale- hover:cursor-pointer"></i>
              <p>0</p>
            </div>

            <div id="share-control">
              <i className="fa-solid fa-share-nodes hover:text-grass hover:scale- hover:cursor-pointer"></i>
            </div>
          </div>

          <div id="right">
            <div id='bookmark-control'>
              <i className="fa-solid fa-bookmark hover:text-grass hover:scale- hover:cursor-pointer"></i>
            </div>
          </div>
        </div>
      </div>

    )
}
