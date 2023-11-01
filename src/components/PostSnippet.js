import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import likeReaction from '/public/images/post-reactions/like.svg'
import heartReaction from '/public/images/post-reactions/heart.svg'
import wowReaction from '/public/images/post-reactions/wow.svg'
import sadReaction from '/public/images/post-reactions/sad.svg'
import angryReaction from '/public/images/post-reactions/angry.svg'


export default function Post( props ) {

    const { username, displayName, publish_date, desc, user_img_src, post_img_src } = props;

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
        <div id='post-footer' className='mt-4 flex flex-row w-full justify-between'>
          <div id="left" className='flex flex-row gap-4'>
            <div id='post-reaction-control' className='flex flex-row justify-center items-center gap-2'>
              <i className="fa-solid fa-heart hover:text-grass hover:scale- hover:cursor-pointer"></i>
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
    );
}
