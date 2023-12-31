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
        currentUserID, currentUserPhotoURL, currentUserDisplayName, currentUserName, postID, postBody, 
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
      const notificationsRef = firestore.collection('users').doc(authorID).collection('notifications');

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
            
            if (currentUserID !== authorID) {
              // Create a new document in the notificationsRef collection
              const notificationRef = notificationsRef.doc();
              await notificationRef.set({
                userID: currentUserID,
                action: "reacted to your post!",
                date: new Date().toISOString(), // Get the server timestamp
                postID: postID,
                userPhotoURL: currentUserPhotoURL,
                displayname: currentUserDisplayName,
                username: currentUserName,
              });
            }
            }
        } else if (reaction === newReaction) {
          // Reaction does not exist, create reaction and add user to userIDs array
          await reactionRef.set({ userIDs: [currentUserID] });

          if (currentUserID !== authorID) {
            // Create a new document in the notificationsRef collection
            const notificationRef = notificationsRef.doc();
            await notificationRef.set({
              userID: currentUserID,
              action: "reacted to your post!",
              date: new Date().toISOString(),  // Get the server timestamp
              postID: postID,
              userPhotoURL: currentUserPhotoURL,
              displayname: currentUserDisplayName,
              username: currentUserName,
            });
          }
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
                <Image width={100} height={100} src={authorPhotoURL} alt="user image" className='rounded-full drop-shadow-sm aspect-square object-cover h-[40px] w-[40px] md:h-[45px] md:w-[45px]'/>
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
          <div id='post-footer' className='mt-4 flex flex-row w-full justify-between relative'>
            <div id="left" className='flex flex-row gap-4 text-sm md:text-base items-center'>
              <div id='post-reaction-control' className='flex flex-row justify-center items-center gap-2 w-fit h-6'>
                {!currentUserReaction && 
                  <i 
                    className={`fa-solid fa-heart hover:text-grass hover:cursor-pointer transition-all ${isOverlayVisible? "text-grass" : ""}`}
                    onClick={() => setIsOverlayVisible(true)}
                    onMouseEnter={() => setIsOverlayVisible(true)}
                  />
                }
                
                {currentUserReaction === 'like' &&
                  <Image
                    src={likeReaction}
                    alt="like reaction"
                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                    onMouseEnter={() => setIsOverlayVisible(true)}
                  />
                }

                {currentUserReaction === 'heart' &&
                  <Image
                    src={heartReaction}
                    alt="heart reaction"
                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                    onMouseEnter={() => setIsOverlayVisible(true)}
                  />
                }

                {currentUserReaction === 'haha' &&
                  <Image
                    src={laughReaction}
                    alt="haha reaction"
                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                    onMouseEnter={() => setIsOverlayVisible(true)}
                  />
                }

                {currentUserReaction === 'wow' &&
                  <Image
                    src={wowReaction}
                    alt="wow reaction"
                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                    onMouseEnter={() => setIsOverlayVisible(true)}
                  />
                }

                {currentUserReaction === 'sad' &&
                  <Image
                    src={sadReaction}
                    alt="sad reaction"
                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                    onMouseEnter={() => setIsOverlayVisible(true)}
                  />
                }

                {currentUserReaction === 'angry' &&
                  <Image
                    src={angryReaction}
                    alt="angry reaction"
                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                    onMouseEnter={() => setIsOverlayVisible(true)}
                  />
                }

                <p>
                  {reactionsLength}
                </p>

                {isOverlayVisible && (
                  <div 
                    onMouseEnter={() => setIsOverlayVisible(true)}
                    onMouseLeave={() => setIsOverlayVisible(false)}
                    id='overlay' 
                    className='absolute -left-1 md:-left-2 flex flex-row gap-2 md:w-[300px] md:h-[45px] justify-center items-center bg-dark_gray rounded-full drop-shadow-sm transition-all' 
                  >
                    <Image 
                      src={likeReaction} 
                      alt="like reaction" 
                      className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                      onClick={() => handleReaction('like')}
                      />
                    <Image 
                      src={heartReaction} 
                      alt="like reaction" 
                      className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                      onClick={() => handleReaction('heart')}
                      />
                    <Image 
                      src={laughReaction} 
                      alt="like reaction" 
                      className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                      onClick={() => handleReaction('haha')}
                      />
                    <Image 
                      src={wowReaction} 
                      alt="like reaction" 
                      className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                      onClick={() => handleReaction('wow')}
                      />
                    <Image 
                      src={sadReaction} 
                      alt="like reaction" 
                      className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                      onClick={() => handleReaction('sad')}
                      />
                    <Image 
                      src={angryReaction} 
                      alt="like reaction" 
                      className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                      onClick={() => handleReaction('angry')}
                      />
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

            <div id="right" className='flex flex-row gap-4 items-center text-sm md:text-base'>
              {currentUserID !== authorID && 
                  <i 
                  id='report-control'
                  onClick={() => {
                    setShowPostExpanded(true)
                    setPostAction('report')
                  }} 
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