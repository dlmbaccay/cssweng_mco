import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import Modal from 'react-modal';
import { firestore, storage, firebase } from '../../lib/firebase';
import Select from 'react-select'
import Router from 'next/router';
import toast from 'react-hot-toast';
import { collection, doc, getDocs, onSnapshot, query, arrayRemove, arrayUnion} from 'firebase/firestore';


import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/haha.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'
import { expandedPostStyle } from '../../lib/modalstyle';
import PostExpanded from './PostExpanded';


export default function Repost( {props} ) {
  const {
    authorID, authorDisplayName, authorUsername, authorPhotoURL,
    id, postDate, postType, postBody, isEdited, repostID, repostBody,
    repostCategory, repostPets, repostDate, repostImageUrls,
    repostAuthorID, repostAuthorDisplayName, repostAuthorUsername,
    repostAuthorPhotoURL
  } = props;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} at ${hours}:${minutes}`;
  };

  // check if repost has images, get first image
  const [repostImage, setRepostImage] = useState(null);
  
  useEffect(() => {
    if (repostImageUrls === undefined) {
      return;
    }

    if (repostImageUrls.length > 0) {
      setRepostImage(repostImageUrls[0]);
    }
  }, []);

  return (
    <div className='drop-shadow-sm hover:drop-shadow-md bg-snow w-[650px] min-h-fit rounded-lg p-6 flex flex-col'>
      
      {/* Header */}
      <div id='post-header' className='flex flex-row'>
        <div id='user-image' className='flex flex-row justify-start items-start'>
          <Image 
            src={authorPhotoURL} alt='Profile Picture' width={45} height={45}
            className='rounded-full drop-shadow-sm aspect-square'
          />
        </div>

        <div id='post-meta' className='ml-4 items-center justify-center'>
              <div id='user-meta' className='flex flex-row gap-2'> {/* displayName, username */}
                <div id='display-name' className='font-bold'><p>{authorDisplayName}</p></div>
                <div className='font-bold'>·</div>
                <Link href={'/user/' + authorUsername} id='display-name' className='hover:text-grass hover:font-bold transition-all'><p>@{authorUsername}</p></Link>
              </div>

              <div id='publish-date' className='flex flex-row gap-2 items-center'> {/* YYYY-MM-DD at HH-MM */}
                <p className='text-sm'>{formatDate(postDate)}</p>
                {isEdited ? 
                  ( 
                    <div className='relative flex flex-row items-center gap-2'>
                      <i className='hover-tooltip fa-solid fa-clock-rotate-left text-xs'/> 
                      <p className='edited-post-tooltip hidden text-xs'>Edited Post</p>
                    </div>
                  )
                : null}
              </div>
          </div>
      </div>

      {/* Body */}
      <div id="post-body" className='mt-3 flex flex-col'>
        <p className='line-clamp-2 overflow-hidden'>{postBody}</p>
      </div>

      {/* Reposted Post */}
      <div className='mt-3 flex flex-col w-full border border-[#d1d1d1] rounded-lg p-4 bg-[#f5f5f5]'>
        
        <div className='flex flex-row'>
            <Image
              src={repostAuthorPhotoURL} alt='Profile Picture' width={45} height={45}
              className='rounded-full drop-shadow-sm aspect-square'
            />

            <div className='ml-4 items-center justify-center'>
              <div className='flex flex-row gap-2'> {/* displayName, username */}
                <div className='font-bold'><p>{repostAuthorDisplayName}</p></div>
                <div className='font-bold'>·</div>
                <Link href={'/user/' + repostAuthorUsername} id='display-name' className='hover:text-grass hover:font-bold transition-all'><p>@{repostAuthorUsername}</p></Link>
              </div>

              <div className='flex flex-row gap-2 items-center'> {/* YYYY-MM-DD at HH-MM */}
                <p className='text-sm'>{formatDate(repostDate)}</p>
              </div>
            </div>
        </div>

        <div className='flex flex-row justify-between mt-2 gap-6 cursor-pointer' 
        onClick={() =>
          Router.push({
            pathname: '/post/[postID]',
            query: { postID: repostID },
          })
        }>
            <div>
              <p className='line-clamp-1 overflow-hidden'>{repostBody}</p>
            </div>

            <div>
              {repostImage !== null ? (
                <Image
                  src={repostImage} alt='Repost Image' width={45} height={45}
                  className='rounded-md drop-shadow-sm aspect-square'
                />
              ) : null}
            </div>
        </div>
      </div>

       {/* TODO: Footer, Expanded Post, Reactions, Comments, Replies */}
    </div>
  )
}
