import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image'
import Modal from 'react-modal'
import { createPostModalStyle } from '../../lib/modalstyle'
import CreatePost from '../CreatePost'

import { firestore } from '../../lib/firebase'
import { collection, query, orderBy, startAfter, limit, getDocs } from 'firebase/firestore';

export default function Newsfeed({ props }) {

  const { 
    user, username, description, 
    email, displayName, userPhotoURL,
    showCreatePostForm, setShowCreatePostForm,
  } = props;

  return (
    <>
      <div className='flex flex-col justify-center items-center pt-8 pb-8'>
        
        {/* create post */}
        <div className='flex flex-row w-[800px] min-h-[100px] bg-snow drop-shadow-lg rounded-lg items-center justify-evenly'>
            {userPhotoURL && <Image src={userPhotoURL} alt={'profile picture'} width={50} height={50} className='h-[60px] w-[60px] rounded-full'/>}
            <button
                className='bg-gray h-[60px] w-[85%] text-sm rounded-xl flex pl-4 items-center hover:bg-white'
                onClick={() => setShowCreatePostForm(true)}
            >
                <input className='text-sm bg-transparent' placeholder='What`s on your mind?' disabled />
            </button>

            {/* create post modal */}
            <Modal
                isOpen={showCreatePostForm}
                onRequestClose={() => setShowCreatePostForm(false)}
                style={createPostModalStyle}
            >
                <CreatePost 
                  props={{
                      currentUserID: user.uid,
                      displayName: displayName,
                      username: username,
                      userPhotoURL: userPhotoURL,
                      setShowCreatePostForm: setShowCreatePostForm,
                  }}
                />
            </Modal>
        </div>

        <div className='w-full h-full'>
          
        </div>
      </div>
    </>
  )
}
