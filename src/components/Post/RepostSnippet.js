import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import Modal from 'react-modal';
import { firestore } from '../../lib/firebase';
import Router from 'next/router';
import toast from 'react-hot-toast';
import { collection, getDocs, onSnapshot} from 'firebase/firestore';


import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/haha.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'
import { expandedPostStyle } from '../../lib/modalstyle';
import RepostExpanded from './RepostExpanded';


export default function RepostSnippet( {props} ) {
  const {
    currentUserID,
    authorID, authorDisplayName, authorUsername, authorPhotoURL,
    postID, postDate, postType, postBody, isEdited, repostID, repostBody,
    repostCategory, repostPets, repostDate, repostImageUrls,
    repostAuthorID, repostAuthorDisplayName, repostAuthorUsername,
    repostAuthorPhotoURL
  } = props;

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [taggedPets, setTaggedPets] = useState([]);
  const [showPostExpanded, setShowPostExpanded] = useState(false);
  const [postAction, setPostAction] = useState('');

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
    };

  return (
    <div className='drop-shadow-sm hover:drop-shadow-md bg-snow w-screen md:w-[650px] min-h-fit rounded-lg p-6 flex flex-col'>
      
      {/* Repost expanded */}
      <Modal isOpen={showPostExpanded} onRequestClose={() => setShowPostExpanded(false)} className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full md:w-[750px] md:h-[95%] overflow-auto md:p-2 rounded-md bg-gray-100 z-50 bg-snow '
        style={{
            overlay: {
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
            }
        }}>
        <RepostExpanded
          props = {{
            currentUserID,
            authorID, authorDisplayName, authorUsername, authorPhotoURL,
            postID, postDate, postType, postBody, isEdited, repostID, repostBody,
            repostCategory, repostPets, repostDate, repostImage,
            repostAuthorID, repostAuthorDisplayName, repostAuthorUsername,
            repostAuthorPhotoURL, setShowPostExpanded, postAction, commentsLength, reactionsLength, formatDate
          }}
        />
      </Modal>

      {/* Header */}
      <div id='post-header' className='flex flex-row'>
        <div id='user-image' className='flex flex-row justify-start items-start'>
          <Image 
            src={authorPhotoURL} alt='Profile Picture' width={45} height={45}
            className='rounded-full drop-shadow-sm aspect-square h-[40px] w-[40px] md:h-[45px] md:w-[45px]'
          />
        </div>

        <div id='post-meta' className='ml-4 items-center justify-center'>
              <div id='user-meta' className='flex flex-row gap-2 text-sm md:text-base'>
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

      {/* Body */}
      <div id="post-body" className='mt-3 flex flex-col'>
        <p className='line-clamp-2 overflow-hidden text-sm md:text-base'>{postBody}</p>
      </div>

      {/* Reposted Post */}
      <div className='mt-3 flex flex-col w-full border border-[#d1d1d1] rounded-lg p-4 bg-[#] drop-shadow-md'>
        
        <div className='flex flex-row'>
            <Image
              src={repostAuthorPhotoURL} alt='Profile Picture' width={45} height={45}
              className='rounded-full drop-shadow-sm aspect-square h-[40px] w-[40px] md:h-[45px] md:w-[45px]'
            />

            <div className='ml-4 items-center justify-center'>
              <div className='flex flex-row gap-2 text-sm md:text-base'> {/* displayName, username */}
                <div className='font-bold'><p>{repostAuthorDisplayName}</p></div>
                <div className='font-bold'>·</div>
                <Link href={'/user/' + repostAuthorUsername} id='display-name' className='hover:text-grass hover:font-bold transition-all'><p>@{repostAuthorUsername}</p></Link>
              </div>

              <div className='flex flex-row gap-2 items-center'> {/* YYYY-MM-DD at HH-MM */}
                <p className='text-xs md:text-sm'>{formatDate(repostDate)}</p>
              </div>
            </div>
        </div>

        <Link
          href={`/post/${repostID}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`flex flex-col md:flex-row mt-2 cursor-pointer ${repostBody === '' ? "justify-center" : "justify-between gap-6"}`}
        >
          <div className='w-full text-justify'>
            <p className={`overflow-hidden text-sm md:text-base ${postBody === '' ? "whitespace-pre-line line-clamp-4" : "line-clamp-1"}`}>{repostBody}</p>
          </div>

          <div className={`w-full flex ${repostBody === '' ? 'justify-center' : 'justify-end'}`}>
            {repostImage !== null ? (
              <Image
                src={repostImage} alt='Repost Image' width={200} height={200}
                className={`rounded-md drop-shadow-sm aspect-square ${repostBody === '' ? "h-[150px] w-[150px] md:h-[200px] md:w-[200px]" : "h-[100px] w-[100px] md:h-[150px] md:w-[150px]"}`}
              />
            ) : null}
          </div>
        </Link>
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
                  const url = `https://bantaybuddy.vercel.app/post/${postID}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Link copied to clipboard!');
                }} 
                className="fa-solid fa-link hover:text-grass hover:cursor-pointer transition-all" />
            </div>
          </div>

          <div id="right" className='flex flex-row gap-4 text-sm md:text-base items-center'>
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
