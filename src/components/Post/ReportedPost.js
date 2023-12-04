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
        authorPhotoURL, isEdited, postType
    } = props 

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [taggedPets, setTaggedPets] = useState([]);
    const [showPostExpanded, setShowPostExpanded] = useState(false);
    const [postAction, setPostAction] = useState('');

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
    const [reactionsLength, setReactionsLength] = useState(0);
    const [currentUserReaction, setCurrentUserReaction] = useState('');

    useEffect(() => {
      const commentsRef = firestore.collection('posts').doc(postID).collection('comments');
      const reactionsRef = firestore.collection('posts').doc(postID).collection('reactions');

      const unsubscribeComments = onSnapshot(commentsRef, async (snapshot) => {
          let totalComments = snapshot.size;

          for (let doc of snapshot.docs) {
              const repliesSnapshot = await getDocs(collection(doc.ref, 'replies'));
              totalComments += repliesSnapshot.size;
          }

          setCommentsLength(totalComments);
      });

      const unsubscribeReactions = onSnapshot(reactionsRef, async (snapshot) => {
          let totalReactions = 0;
          let currentUserReaction = null;

          const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Replace with your actual reaction types

          for (let doc of snapshot.docs) {
              const reactionData = doc.data();
              totalReactions += reactionData.userIDs.length;

              if (reactionData.userIDs.includes(currentUserID)) {
                  currentUserReaction = reactionTypes.find(type => type === doc.id);
              }
          }

          setReactionsLength(totalReactions);
          setCurrentUserReaction(currentUserReaction);
      });

      // Clean up the subscriptions on unmount
      return () => {
          unsubscribeComments();
          unsubscribeReactions();
      };
    }, [postID]);

    const handleReaction = async (newReaction) => {
      const reactionsRef = firestore.collection('posts').doc(postID).collection('reactions');
      const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Replace with your actual reaction types

      for (let reaction of reactionTypes) {
        const reactionRef = reactionsRef.doc(reaction);
        const reactionDoc = await reactionRef.get();

        if (reactionDoc.exists) {
          const reactionData = reactionDoc.data();
          const userIDs = reactionData.userIDs;

          if (userIDs.includes(currentUserID)) {
            if (reaction === newReaction) {
              // User has reacted with the same type again, remove user from userIDs array
              const updatedUserIDs = userIDs.filter((userID) => userID !== currentUserID);
              await reactionRef.update({ userIDs: updatedUserIDs });
              setCurrentUserReaction('');
            } else {
              // User has reacted with a different type, remove user from current userIDs array
              const updatedUserIDs = userIDs.filter((userID) => userID !== currentUserID);
              await reactionRef.update({ userIDs: updatedUserIDs });
            }
          } else if (reaction === newReaction) {
            // User has not reacted with this type, add user to userIDs array
            await reactionRef.update({ userIDs: [...userIDs, currentUserID] });
          }
        } else if (reaction === newReaction) {
          // Reaction does not exist, create reaction and add user to userIDs array
          await reactionRef.set({ userIDs: [currentUserID] });
        }
      }

      setIsOverlayVisible(false);
    }

    useEffect(() => {
      getTaggedPets();
    }, []);

    return (
      <div 
        className='drop-shadow-sm hover:drop-shadow-md bg-snow w-screen md:w-[650px] min-h-fit rounded-lg p-6 flex flex-col'>

          {/* Post expanded */}
          <Modal isOpen={showPostExpanded} onRequestClose={() => setShowPostExpanded(false)} 
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full md:w-[750px] md:h-[95%] overflow-auto p-2 rounded-md bg-gray-100 z-50 bg-snow '
            style={{
                overlay: {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                }
            }}
            >
            <PostExpanded
              props = {{
                currentUserID, postID, postBody, postCategory, postTrackerLocation,
                postPets, postDate, imageUrls, authorID, authorDisplayName, authorUsername,
                authorPhotoURL, isEdited, taggedPets, formatDate,
                setShowPostExpanded, postAction, commentsLength, reactionsLength
              }}
            />
          </Modal>

          {/* Header */}
          <div id="post-header" className='flex flex-col md:flex-row justify-between'>

            <div className='flex flex-row justify-start items-start '>
              <div id="user-image">
                <Image width={45} height={45} src={authorPhotoURL} alt="user image" className='rounded-full drop-shadow-sm aspect-square h-[40px] w-[40px] md:h-[45px] md:w-[45px]'/>
              </div>

              <div id='post-meta' className='ml-4 items-center justify-center'>
                  <div id='user-meta' className='flex flex-row gap-2 text-sm md:text-base'> {/* displayName, username */}
                    <div id='display-name' className='font-bold'><p>{authorDisplayName}</p></div>
                    <div className='font-bold'>·</div>
                    <Link href={'/user/' + authorUsername} id='display-name' className='hover:text-grass hover:font-bold transition-all'><p>@{authorUsername}</p></Link>
                  </div>

                  <div id='publish-date' className='flex flex-row gap-2 items-center'> {/* YYYY-MM-DD at HH-MM */}
                    <p className='text-xs md:text-sm'>{formatDate(postDate)}</p>
                    {isEdited ? 
                      ( 
                        <div className='relative flex flex-row items-center gap-2'>
                          <i className='hover-tooltip fa-solid fa-clock-rotate-left text-[10px] md:text-xs'/> 
                          <p className='edited-post-tooltip hidden text-xs'>Edited Post</p>
                        </div>
                      )
                    : null}
                  </div>
              </div>
            </div>

            <div className='flex flex-col w-fit items-end mt-3 md:mt-0 text-sm md:text-base'>
              {postCategory !== 'Default' && (
                <div className='flex flex-row items-center justify-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-grass'></div>
                  <p>{postCategory}</p>
                </div>
              )}
            </div>

          </div>

          {/* Body */}
          <div id='post-body' className='mt-2 md:mt-3 flex flex-col'>
            <div id='post-pets' className='mr-auto mb-2'>
              {/* display their names */}
              {postPets.length > 0 && (
                <div className='flex flex-row items-center justify-center gap-2'>
                  {taggedPets.length === 1 && <i className="fa-solid fa-tag text-xs md:text-md"></i>}
                  {taggedPets.length > 1 && <i className="fa-solid fa-tags text-xs md:text-md"></i>}
                  {/* <p className='line-clamp-1 overflow-hidden text-md'>{taggedPets.map(pet => pet.petName).join(', ')}</p> */}
                  <p className='line-clamp-1 overflow-hidden text-sm md:text-sm'>
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

            { (postCategory === 'Unknown Owner' || postCategory === 'Retrieved Pets') && 
              <div className='flex flex-row items-center gap-1 mb-2'>
                <p className='text-sm'>Found At:</p>
                <p className='line-clamp-1 overflow-hidden text-sm'>{postTrackerLocation}</p>
              </div>
            }

            {
              postCategory === 'Lost Pets' && 
              <div className='flex flex-row items-center gap-1 mb-2'>
                <p className='text-sm'>Last Seen:</p>
                <p className='line-clamp-1 overflow-hidden text-sm'>{postTrackerLocation}</p>
              </div>
            }

            <div id='post-text'>
              <p
                onClick={() => {
                  setShowPostExpanded(true)
                  setPostAction('view')
                }} 
                className='whitespace-pre-line line-clamp-1 text-sm md:text-base md:line-clamp-4 overflow-hidden cursor-pointer text-justify'>{postBody}</p>
            </div>
            
            { imageUrls.length >= 1 &&
              <div id="post-image" className='h-[200px] mt-2 md:mt-4 md:h-[300px] w-auto flex items-center justify-center relative'>
                {imageUrls.length > 1 && (
                  <>
                    <i className="fa-solid fa-circle-chevron-left absolute left-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all pl-2 md:pl-0" 
                      onClick={() => {
                        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
                      }}
                    ></i>
                    <i className="fa-solid fa-circle-chevron-right absolute right-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all pr-2 md:pr-0" 
                      onClick={() => {
                        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
                      }}></i>
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
          <div id='post-footer' className='mt-4 flex flex-col w-full relative'>
            <div className='flex flex-row w-full justify-between relative border-dark_gray border-y-2 p-2 rounded-md hover:bg-dark_gray hover:cursor-pointer transition-all'>
              <div id="left" className='flex flex-row gap-4 text-sm md:text-base items-center'>
                <div className="text-md w-[30px] h-[30px]
                    flex items-center justify-center
                    fa-solid fa-file-lines rounded-full 
                    bg-raisin_black text-snow"></div>

                <p className='font-semibold transition-all'>See details</p>    
              </div>
              <div id="right" className='flex flex-row gap-4 items-center text-sm md:text-base'>
                <div className="fa-solid fa-chevron-right"></div>            
              </div>
            </div>
            <div className='flex flex-row items-center justify-center gap-3 mt-5 mx-20 max-sm:mx-0'>
              <button className='h-full w-full bg-[#9AD69C] font-bold rounded-md hover:bg-[#27C62D] transition-all'>Accept</button>
              <button className='h-full w-full bg-[#D69A9A] font-bold rounded-md hover:bg-[#DE3939] transition-all'>Reject</button>
            </div>
          </div>
      </div>
    )
}