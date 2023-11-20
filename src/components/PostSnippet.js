import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import Modal from 'react-modal';
import { firestore, storage, firebase } from '../lib/firebase';
import Select from 'react-select'
import Router from 'next/router';
import toast from 'react-hot-toast';
import { collection, doc, getDocs, onSnapshot, query } from 'firebase/firestore';


import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/laugh.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'
import { expandedPostStyle } from '../lib/modalstyle';
import PostExpanded from './PostExpanded';

export default function PostSnippet({ props }) {

    useEffect(() => {
      if (document.getElementById('root')) {
        Modal.setAppElement('#root');
      }
    }, []);

    const {
        currentUserID, postID, postBody, 
        postCategory, postTrackerLocation,
        postPets, postDate, imageUrls,
        authorID, authorDisplayName, authorUsername,
        authorPhotoURL, isEdited
    } = props 

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [taggedPets, setTaggedPets] = useState([]);
    const [showPostExpanded, setShowPostExpanded] = useState(false);
    const [postAction, setPostAction] = useState('');

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
        const pet = { id: petDoc.id, ...petDoc.data() };
        return pet;
      }));

      setTaggedPets(taggedPets);
    };

    const [commentsLength, setCommentsLength] = useState(0);
    const [likesLength, setLikesLength] = useState(0);

    useEffect(() => {
      const commentsRef = collection(doc(firestore, 'posts', postID), 'comments');
      const likesRef = collection(doc(firestore, 'posts', postID), 'likes');

      const unsubscribeComments = onSnapshot(commentsRef, async (snapshot) => {
        let totalComments = snapshot.size;

        for (let doc of snapshot.docs) {
          const repliesSnapshot = await getDocs(collection(doc.ref, 'replies'));
          totalComments += repliesSnapshot.size;
        }

        setCommentsLength(totalComments);
      });

      const unsubscribeLikes = onSnapshot(likesRef, (snapshot) => {
        setLikesLength(snapshot.size);
      });

      // Clean up the subscriptions on unmount
      return () => {
        unsubscribeComments();
        unsubscribeLikes();
      };
    }, [postID]);

    useEffect(() => {
      getTaggedPets();
    }, []);

    return (
      <div 
        className='drop-shadow-sm hover:drop-shadow-md bg-snow w-[650px] min-h-fit rounded-lg p-6 flex flex-col'>

          {/* Post expanded */}
          <Modal isOpen={showPostExpanded} onRequestClose={() => setShowPostExpanded(false)} style={expandedPostStyle}>
            <PostExpanded
              props = {{
                currentUserID, postID, postBody, postCategory, postTrackerLocation,
                postPets, postDate, imageUrls, authorID, authorDisplayName, authorUsername,
                authorPhotoURL, isEdited, taggedPets, formatDate,
                setShowPostExpanded, postAction
              }}
            />
          </Modal>

          {/* Header */}
          <div id="post-header" className='flex flex-row justify-between'>

            <div className='flex flex-row justify-start items-start '>
              <div id="user-image">
                <Image width={45} height={45} src={authorPhotoURL} alt="user image" className='rounded-full drop-shadow-sm'/>
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

            <div className='flex flex-col w-fit items-end'>
              {postCategory !== 'Default' && (
                <div className='flex flex-row items-center justify-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-grass'></div>
                  <p>{postCategory}</p>
                </div>
              )}
            </div>

          </div>

          {/* Body */}
          <div id='post-body' className='mt-3 flex flex-col'>
            <div id='post-pets' className='mr-auto mb-2'>
              {/* display their names */}
              {postPets.length > 0 && (
                <div className='flex flex-row items-center justify-center gap-2'>
                  {taggedPets.length === 1 && <i class="fa-solid fa-tag text-md"></i>}
                  {taggedPets.length > 1 && <i class="fa-solid fa-tags text-md"></i>}
                  {/* <p className='line-clamp-1 overflow-hidden text-md'>{taggedPets.map(pet => pet.petName).join(', ')}</p> */}
                  <p className='line-clamp-1 overflow-hidden text-md'>
                    {taggedPets.map((pet, index) => (
                        <span key={pet.id}>
                            <Link href={`/pet/${pet.id}`} title={pet.petName} className='hover:text-grass hover:font-bold transition-all'>
                                {pet.petName}
                            </Link>
                            {index < taggedPets.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </p>
                </div>
              )}
            </div>

            { (postCategory === 'Lost Pets' || postCategory === 'Unknown Owner' || postCategory === 'Retrieved Pets') && 
              <div className='flex flex-row items-center gap-2 mb-2'>
                <i className='fa-solid fa-location-crosshairs'/>
                <p className='line-clamp-1 overflow-hidden text-md'>{postTrackerLocation}</p>
              </div>
            }

            <div id='post-text'>
              <p
                onClick={() => {
                  setShowPostExpanded(true)
                  setPostAction('view')
                }} 
                className='whitespace-pre-line line-clamp-4 overflow-hidden cursor-pointer'>{postBody}</p>
            </div>
            
            { imageUrls.length >= 1 &&
              <div id="post-image" className='mt-4 h-[300px] w-auto flex items-center justify-center relative'>
                {imageUrls.length > 1 && (
                  <>
                    <i className="fa-solid fa-circle-chevron-left absolute left-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all" onClick={prevImage}></i>
                    <i className="fa-solid fa-circle-chevron-right absolute right-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all" onClick={nextImage}></i>
                  </>
                )}
                <Image src={imageUrls[currentImageIndex]} alt="post image" 
                  layout='fill'
                  objectFit='contain'
                  className='rounded-lg cursor-pointer'
                  onClick={() => {
                    setShowPostExpanded(true)
                    setPostAction('view')
                  }}
                  />
              </div>
            }
          </div>

          {/* Footer */}
          <div id='post-footer' className='mt-3 flex flex-row w-full justify-between relative'>
            <div id="left" className='flex flex-row gap-4'>
              <div id='post-reaction-control' className='flex flex-row justify-center items-center gap-2'>
                <i 
                  className={`fa-solid fa-heart hover:text-grass hover:cursor-pointer transition-all ${isOverlayVisible? "text-grass" : ""}`}
                  onMouseEnter={() => setIsOverlayVisible(true)}
                  onMouseLeave={() => setIsOverlayVisible(false)}
                />
                <p>
                  {likesLength}
                </p>

                {isOverlayVisible && (
                  <div 
                    onMouseEnter={() => setIsOverlayVisible(true)}
                    onMouseLeave={() => setIsOverlayVisible(false)}
                    id='overlay' 
                    className='absolute bottom-4 -left-2 flex flex-row gap-2 w-[300px] h-[45px] justify-center items-center bg-dark_gray rounded-full drop-shadow-sm transition-all' 
                  >
                    <Image src={likeReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                    <Image src={heartReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                    <Image src={laughReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                    <Image src={wowReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                    <Image src={sadReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                    <Image src={angryReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                  </div>
                )}
              </div>
              
              <div id="comment-control" className='flex flex-row justify-center items-center gap-2'>
                <i 
                  onClick={() => {
                    setShowPostExpanded(true)
                    setPostAction('comment')
                  }}
                  className="fa-solid fa-comment hover:text-grass hover:cursor-pointer transition-all"></i>
                <p>
                  {commentsLength}
                </p>
              </div>

              <div>
                <i id="share-control"
                  onClick={() => {
                    setShowPostExpanded(true)
                    setPostAction('share')
                  }} 
                  className="fa-solid fa-share-nodes hover:text-grass hover:cursor-pointer transition-all" />
              </div>
            </div>

            <div id="right" className='flex flex-row gap-4 items-center'>
              {currentUserID !== authorID && 
                  <i 
                  id='report-control'
                  className="fa-solid fa-flag hover:text-grass hover:cursor-pointer transition-all" />
              }

              {currentUserID === authorID && (
                <>
                    <i 
                      id='edit-control'
                      className="fa-solid fa-pencil hover:text-grass hover:scale- hover:cursor-pointer"
                       onClick={() => {
                        setShowPostExpanded(true)
                        setPostAction('edit')
                      }}
                    >
                    </i>

                    <i 
                      id='delete-control'
                      onClick={() => {
                        setShowPostExpanded(true)
                        setPostAction('delete')
                      }}
                      className="fa-solid fa-trash hover:text-red-600 hover:scale- hover:cursor-pointer"
                    ></i>
                </>
              )}
            </div>
          </div>
      </div>
    )
}