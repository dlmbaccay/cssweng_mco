import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import Modal from 'react-modal';
import { firestore } from '../lib/firebase';

import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/laugh.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'
import { confirmationModalStyle, editPostModalStyle } from '../lib/modalstyle';

export default function Post({ props }) {

    useEffect(() => {
        Modal.setAppElement('#root')
    }, []);

    const {
        currentUserID, postID, postBody, postCategory,
        postPets, postDate, imageUrls,
        authorID, authorDisplayName, authorUsername,
        authorPhotoURL, likes, comments
    } = props 

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [taggedPets, setTaggedPets] = useState([]);

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

    const nextImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    };

    // Function to format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} at ${hours}:${minutes}`;
    };

    // get pets' names, if any
    const getTaggedPets = async () => {
      const taggedPets = await Promise.all(postPets.map(async (petID) => {
        const petRef = firestore.collection('pets').doc(petID);
        const petDoc = await petRef.get();
        const pet = petDoc.data();
        return pet;
      }));

      setTaggedPets(taggedPets);
    };

    useEffect(() => {
      getTaggedPets();
    }, []);

    const [showDeletePostModal, setShowDeletePostModal] = useState(false);

    const handleDeletePost = async () => {
      const postRef = firestore.collection('posts').doc(postID);
      await postRef.delete();

      // reload page
      window.location.reload();
    }

    const [showEditPostModal, setShowEditPostModal] = useState(false);
    const [newPostBody, setNewPostBody] = useState(postBody);

    const handleEditPost = async () => {
      const postRef = firestore.collection('posts').doc(postID);
      await postRef.update({
        postBody: newPostBody
      });

      // reload page
      window.location.reload();
    }

    return (
      imageUrls.length === 0 ? (
        <div className='shadow-sm hover:shadow-lg bg-snow w-[800px] h-[250px] rounded-3xl p-6 flex flex-col justify-between'>
        {/* Header */}
          <div id="post-header" className='flex flex-row'>

            <div className='flex flex-row'>
              {/* User Image */}
              <div id="user-image">
                <Image width={50} height={50} src={authorPhotoURL} alt="user image" className='rounded-full shadow-md'/>
              </div>

              <div id='post-meta' className='ml-4 h-full items-center justify-center'>
                  <div id='user-meta' className='flex flex-row gap-2 '>
                    {/* Display Name */}
                    <div id='display-name' className='font-bold'>
                      <p>{authorDisplayName}</p>
                    </div>

                    <div className='font-bold'>
                      ·
                    </div>

                    {/* Username */}
                    <Link href={'/user/' + authorUsername} id='display-name' className='hover:text-grass hover:font-semibold transition-all'>
                      <p>@{authorUsername}</p>
                    </Link>
                  </div>
    
                  {/* Publish Date */}
                  <div id='publish-date'>
                    <p>{formatDate(postDate)}</p>
                  </div>
              </div>
            </div>

            <div className='flex flex-col bg-slate ml-auto w-1/3'>
              {/* Category */}
              <div id='post-category' className='ml-auto'>
                {postCategory !== 'Default' && (
                  <div className='flex flex-row items-center justify-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-grass'></div>
                    <p>{postCategory}</p>
                  </div>
                )}
              </div>

              {/* Pets */}
              <div id='post-pets' className='ml-auto'>
                {/* display their names */}
                {postPets.length > 0 && (
                  <div className='flex flex-row items-center justify-center gap-2'>
                    <i class="fa-solid fa-tag"></i>
                    <p className='line-clamp-1 overflow-hidden'>{taggedPets.map(pet => pet.petName).join(', ')}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Body */}
          <div id='post-body' className='mt-4 flex flex-col h-full'>
            <div id='post-text'>
              <p className='whitespace-pre-line line-clamp-4 overflow-hidden'>{postBody}</p>
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

            <div id="right" className='flex flex-row gap-4'>
              <div id='bookmark-control'>
                <i className="fa-solid fa-bookmark hover:text-grass hover:scale- hover:cursor-pointer"></i>
              </div>

              {currentUserID === authorID && (
                <>
                  <div id="edit-control">
                    <i className="fa-solid fa-pencil hover:text-grass hover:scale- hover:cursor-pointer"
                    onClick={() => setShowEditPostModal(true)}
                    >
                    </i>

                    <Modal isOpen={showEditPostModal} onRequestClose={() => setShowEditPostModal(false)} className='flex flex-col items-center justify-center outline-none' style={editPostModalStyle}>
                      <div className='flex flex-col w-full h-full'>
                        <div className='flex flex-row justify-center items-center'>
                          <p className='font-semibold'>Edit Post</p>
                        </div>

                        <div className='h-full mt-2 mb-3'>
                          <textarea 
                              id="post-body" 
                              value={newPostBody}
                              onChange={(event) => setNewPostBody(event.target.value)}
                              placeholder='What`s on your mind?' 
                              className='outline-none resize-none border border-[#d1d1d1] rounded-md text-raisin_black w-full h-full p-4' 
                          />
                        </div>
                        
                        <div className='flex flex-row gap-2'>
                          <button 
                            className='px-4 py-2 bg-black text-white font-semibold hover:bg-red-600 rounded-lg text-sm cursor-pointer w-1/2 transition-all'
                            onClick={() => setShowEditPostModal(false)}>
                              Cancel
                          </button>

                          <button 
                            className='bg-xanthous hover:bg-pistachio text-white font-semibold rounded-md px-4 text-sm py-2 w-1/2 transition-all' 
                            onClick={handleEditPost}>
                              Save
                          </button>
                        </div>
                      </div>
                    </Modal>
                  </div>

                  <div id="delete-control">
                    <i className="fa-solid fa-trash hover:text-red-600 hover:scale- hover:cursor-pointer"
                    onClick={() => setShowDeletePostModal(true)}
                    ></i>

                    <Modal isOpen={showDeletePostModal} onRequestClose={() => setShowDeletePostModal(false)} className='flex flex-col items-center justify-center outline-none' style={confirmationModalStyle}>
                      <div className='flex flex-col items-center justify-center gap-4'>
                        <p className='font-bold text-base'>Are you sure you want to delete this post?</p>
                        <div className='flex flex-row gap-4'>
                          <button className='bg-black hover:bg-red-600 text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={handleDeletePost}>Delete</button>
                          <button className='bg-gray-400 hover:bg-black hover:text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={() => setShowDeletePostModal(false)}>Cancel</button>
                        </div>
                      </div>
                    </Modal>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='shadow-sm hover:shadow-lg bg-snow w-[800px] h-[500px] rounded-3xl p-6 flex flex-col'>
        {/* Header */}
          <div id="post-header" className='flex flex-row'>

            <div className='flex flex-row'>
              {/* User Image */}
              <div id="user-image">
                <Image width={50} height={50} src={authorPhotoURL} alt="user image" className='rounded-full shadow-md'/>
              </div>

              <div id='post-meta' className='ml-4 h-full items-center justify-center'>
                  <div id='user-meta' className='flex flex-row gap-2 '>
                    {/* Display Name */}
                    <div id='display-name' className='font-bold'>
                      <p>{authorDisplayName}</p>
                    </div>

                    <div className='font-bold'>
                      ·
                    </div>

                    {/* Username */}
                    <Link href={'/user/' + authorUsername} id='display-name' className='hover:text-grass hover:font-semibold transition-all'>
                      <p>@{authorUsername}</p>
                    </Link>
                  </div>
    
                  {/* Publish Date */}
                  <div id='publish-date'>
                    <p>{formatDate(postDate)}</p>
                  </div>
              </div>
            </div>

            <div className='flex flex-col bg-slate ml-auto w-1/3'>
              {/* Category */}
              <div id='post-category' className='ml-auto'>
                {postCategory !== 'Default' && (
                  <div className='flex flex-row items-center justify-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-grass'></div>
                    <p>{postCategory}</p>
                  </div>
                )}
              </div>

              {/* Pets */}
              <div id='post-pets' className='ml-auto'>
                {/* display their names */}
                {postPets.length > 0 && (
                  <div className='flex flex-row items-center justify-center gap-2'>
                    <i class="fa-solid fa-tag"></i>
                    <p className='line-clamp-1 overflow-hidden'>{taggedPets.map(pet => pet.petName).join(', ')}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Body */}
          <div id='post-body' className='mt-4 flex flex-col'>
            <div id='post-text'>
              <p className='whitespace-pre-line line-clamp-1 overflow-hidden'>{postBody}</p>
            </div>
            
            {/* Image Carousel */}
            <div id="post-image" className='mt-4 h-[310px] w-auto flex items-center justify-center relative'>
              {imageUrls.length > 1 && (
                <>
                  <i className="fa-solid fa-chevron-left absolute left-0 cursor-pointer z-10" onClick={prevImage}></i>
                  <i className="fa-solid fa-chevron-right absolute right-0 cursor-pointer z-10" onClick={nextImage}></i>
                </>
              )}
              <Image src={imageUrls[currentImageIndex]} alt="post image" 
                layout='fill'
                objectFit='contain'
                className='rounded-lg'
                />
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

            <div id="right" className='flex flex-row gap-4'>
              <div id='bookmark-control'>
                <i className="fa-solid fa-bookmark hover:text-grass hover:scale- hover:cursor-pointer"></i>
              </div>

              {currentUserID === authorID && (
                <>
                  <div id="edit-control">
                    <i className="fa-solid fa-pencil hover:text-grass hover:scale- hover:cursor-pointer"
                    onClick={() => setShowEditPostModal(true)}
                    >
                    </i>

                    <Modal isOpen={showEditPostModal} onRequestClose={() => setShowEditPostModal(false)} className='flex flex-col items-center justify-center outline-none' style={editPostModalStyle}>
                      <div className='flex flex-col w-full h-full'>
                        <div className='flex flex-row justify-center items-center'>
                          <p className='font-semibold'>Edit Post</p>
                        </div>

                        <div className='h-full mt-2 mb-3'>
                          <textarea 
                              id="post-body" 
                              value={newPostBody}
                              onChange={(event) => setNewPostBody(event.target.value)}
                              placeholder='What`s on your mind?' 
                              className='outline-none resize-none border border-[#d1d1d1] rounded-md text-raisin_black w-full h-full p-4' 
                          />
                        </div>
                        
                        <div className='flex flex-row gap-2'>
                          <button 
                            className='px-4 py-2 bg-black text-white font-semibold hover:bg-red-600 rounded-lg text-sm cursor-pointer w-1/2 transition-all'
                            onClick={() => setShowEditPostModal(false)}>
                              Cancel
                          </button>

                          <button 
                            className='bg-xanthous hover:bg-pistachio text-white font-semibold rounded-md px-4 text-sm py-2 w-1/2 transition-all' 
                            onClick={handleEditPost}>
                              Save
                          </button>
                        </div>
                      </div>
                    </Modal>
                  </div>

                  <div id="delete-control">
                    <i className="fa-solid fa-trash hover:text-red-600 hover:scale- hover:cursor-pointer"
                    onClick={() => setShowDeletePostModal(true)}
                    ></i>

                    <Modal isOpen={showDeletePostModal} onRequestClose={() => setShowDeletePostModal(false)} className='flex flex-col items-center justify-center outline-none' style={confirmationModalStyle}>
                      <div className='flex flex-col items-center justify-center gap-4'>
                        <p className='font-bold text-base'>Are you sure you want to delete this post?</p>
                        <div className='flex flex-row gap-4'>
                          <button className='bg-black hover:bg-red-600 text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={handleDeletePost}>Delete</button>
                          <button className='bg-gray-400 hover:bg-black hover:text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={() => setShowDeletePostModal(false)}>Cancel</button>
                        </div>
                      </div>
                    </Modal>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )
    )
}