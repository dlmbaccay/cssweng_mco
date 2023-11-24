import React from 'react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { firestore } from '../../lib/firebase';
import Modal from 'react-modal';
import { postDeleteConfirmationModalStyle } from '../../lib/modalstyle';
import Link from 'next/link'

import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/haha.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'

export default function Reply({props}) {

    const {
        currentUserID, currentUserUsername, currentUserPhotoURL, currentUserDisplayName,
        postID, commentID, replyID, replyBody, replyDate, isEdited,
        authorID, authorDisplayName, authorUsername, authorPhotoURL
    } = props;

    useEffect(() => {
        if (document.getElementById('root')) {
            Modal.setAppElement('#root');
        }
    }, []);

    const formatReplyDate = () => {
        const date = new Date(replyDate);
        const now = new Date();
        const diff = now - date;
        const secs = Math.floor(diff / 1000);
        const mins = Math.floor(secs / 60);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);

        if (secs < 60) {
            return 'Just now';
        } else if (mins < 60) {
            return `${mins === 1 ? '1 minute' : `${mins} minutes`} ago`;
        } else if (hours < 24) {
            return `${hours === 1 ? '1 hour' : `${hours} hours`} ago`;
        } else if (days < 7) {
            return `${days === 1 ? '1 day' : `${days} days`} ago`;
        } else if (weeks < 4) {
            return `${weeks === 1 ? '1 week' : `${weeks} weeks`} ago`;
        }
    }

    const [showDeleteReplyModal, setShowDeleteReplyModal] = useState(false);

    const handleDeleteReply = async (event) => {

        try {
        // Delete reactions to the reply
            const reactionsSnapshot = await firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('replies').doc(replyID).collection('reactions').get();
            for (const reactionDoc of reactionsSnapshot.docs) {
                await reactionDoc.ref.delete();
            }

            // Delete the reply itself
            await firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('replies').doc(replyID).delete();

            toast.success('Reply deleted successfully!');
        } catch (error) {
            console.error('Error deleting reply:', error);
            toast.error('Error occurred while deleting the reply.');
        }

        event.stopPropagation();
        setShowDeleteReplyModal(false);
        toast.success('Reply deleted successfully!');
    }

    const [editedReplyBody, setEditedReplyBody] = useState(replyBody);
    const [isEditingReply, setIsEditingReply] = useState(false);

    const handleEditReply = (event) => {
        event.preventDefault();

        if (editedReplyBody.trim() === '') {
            toast.error('Reply cannot be empty!');
            return;
        }

        // Update reply in firestore
        firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('replies').doc(replyID).update({
            replyBody: editedReplyBody,
            isEdited: true,
            replyDate: new Date().toISOString()
        })
        .then(() => {
            toast.success('Reply edited successfully!');
            setIsEditingReply(false);
        })
        .catch((error) => {
            toast.error(error.message);
        })
    }

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    
    const handleReplyReaction = async (newReaction) => {
        const reactionsRef = firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('replies').doc(replyID).collection('reactions');
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
    }

    const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Replace with your actual reaction types

    // get current user reaction
    const [currentUserReaction, setCurrentUserReaction] = useState('');

    // read all reactions of this reply
    const [allReactions, setAllReactions] = useState([]);

    useEffect(() => {
        const reactionsRef = firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('replies').doc(replyID).collection('reactions');
        const unsubscribe = reactionsRef.onSnapshot((snapshot) => {
            let currentUserReaction = '';
            let allReactions = [];

            snapshot.docs.forEach(doc => {
                const reaction = doc.id;
                const userIDs = doc.data().userIDs;

                if (reactionTypes.includes(reaction)) {
                    if (userIDs.includes(currentUserID)) {
                        currentUserReaction = reaction;
                    }
                    allReactions.push({ reaction: reaction, userIDs: userIDs });
                }
            });

            setCurrentUserReaction(currentUserReaction);
            setAllReactions(allReactions);
        })

        return () => unsubscribe();
    }, []);

    const reactionImages = {
        like: { src: likeReaction, alt: 'like reaction' },
        heart: { src: heartReaction, alt: 'heart reaction' },
        haha: { src: laughReaction, alt: 'haha reaction' },
        wow: { src: wowReaction, alt: 'wow reaction' },
        sad: { src: sadReaction, alt: 'sad reaction' },
        angry: { src: angryReaction, alt: 'angry reaction' },
    };

    return (
        <div className='flex flex-row w-full items-start min-h-[60px] max-h-fit gap-2'>
            <Image src={authorPhotoURL} alt={authorDisplayName} width={40} height={40} className='rounded-full aspect-square' />

            <div className='flex flex-col w-full'>
                <div className='flex flex-col gap-1 w-full bg-[#F5F5F5] items-start break-all py-2 px-3 text-sm rounded-xl border border-[#d1d1d1] drop-shadow-sm'>
                    <div>
                        <span className='font-bold'>{authorDisplayName}</span>
                        <span className='font-bold'> · </span>
                        <Link href={`/user/${authorUsername}`} className='hover:font-bold hover:text-grass transition-all'> @{authorUsername}</Link>
                    </div>
                    
                    {!isEditingReply && (
                        <div>
                        <p>{replyBody}</p>

                        {/* if each reaction's userIDs are not 0 */}
                        {allReactions.filter((reaction) => reaction.userIDs.length > 0).length > 0 && (
                                <div className='flex flex-row gap-2 items-center mt-2'>
                                    {allReactions.filter((reaction) => reaction.userIDs.length > 0).map((reaction, index) => (
                                        <div key={index} className='flex flex-row gap-1 items-center'>
                                            <Image 
                                                src={reactionImages[reaction.reaction].src} 
                                                alt={reactionImages[reaction.reaction].alt} 
                                                className='w-[15px] h-[15px] rounded-full' 
                                            />
                                            <p className='text=xs'>{reaction.userIDs.length}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {isEditingReply && (
                        <form
                            onSubmit={(event) => {
                                handleEditReply(event);
                            }}

                            className='flex flex-row w-full items-start justify-center h-full mb-1'
                        >
                            <textarea
                                value={editedReplyBody}
                                onChange={(event) => setEditedReplyBody(event.target.value)}
                                maxLength={100}
                                onKeyDown={(event => {
                                    if (event.key === 'Enter') {
                                        handleEditReply(event);
                                    }
                                })}
                                placeholder='Write a reply...'
                                className={`outline-none resize-none border-t border-l border-b border-[#d1d1d1] text-sm rounded-l-md text-raisin_black w-full p-3 transition-all h-[80px]`}
                            />

                            <div className='flex flex-col h-[80px] w-[40px] bg-white border-t border-r border-b border-[#d1d1d1] items-center justify-center text-xs rounded-r-md'>
                                <button type='submit' className='flex items-center h-1/2 w-full justify-center rounded-rt-md hover:bg-grass hover:text-snow rounded-tr-md'>
                                    <i className='fa-solid fa-check h-1/2 flex items-center' />
                                </button>
                                <button type='button' 
                                    onClick={() => {
                                        setIsEditingReply(false);
                                        setEditedReplyBody(editedReplyBody);
                                    }} 
                                    className='flex items-center h-1/2 w-full justify-center hover:bg-grass hover:text-snow rounded-br-md'>
                                    <i className='fa-solid fa-xmark h-1/2 flex items-center' />
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className='flex flex-row w-full text-xs gap-2 pl-3 mt-1'>
                    <div id='like-control'
                        className='flex items-center justify-center'
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)}
                    >
                        {currentUserReaction === '' && 
                            <i 
                                className={`fa-solid fa-heart hover:text-grass hover:cursor-pointer transition-all ${isOverlayVisible? "text-grass" : ""}`}
                                onMouseEnter={() => setIsOverlayVisible(true)}
                                onMouseLeave={() => setIsOverlayVisible(false)}
                            />
                        }

                        {currentUserReaction !== '' &&(
                            <div className='flex flex-row gap-1'>
                                <Image
                                    src={reactionImages[currentUserReaction].src}
                                    alt={reactionImages[currentUserReaction].alt}
                                    className={`mt-[1px] w-fit h-[15px] flex items-center justify-center hover:transform transition-all `}
                                    onMouseEnter={() => setIsOverlayVisible(true)}
                                    onMouseLeave={() => setIsOverlayVisible(false)} 
                                />

                                <p className='capitalize font-semibold text-[12px] flex items-center'>
                                    {currentUserReaction}
                                </p>
                            </div>
                        )}

                        {isOverlayVisible && (
                            <div 
                                onMouseEnter={() => setIsOverlayVisible(true)}
                                onMouseLeave={() => setIsOverlayVisible(false)}
                                id='overlay' 
                                className='absolute top-13 left-24 flex flex-row gap-2 w-[240px] h-[45px] justify-center items-center bg-dark_gray rounded-full drop-shadow-sm transition-all' 
                            >
                                <Image 
                                src={likeReaction} 
                                alt="like reaction" 
                                className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                onClick={() => handleReplyReaction('like')}
                                />
                                <Image 
                                src={heartReaction} 
                                alt="like reaction" 
                                className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                onClick={() => handleReplyReaction('heart')}
                                />
                                <Image 
                                src={laughReaction} 
                                alt="like reaction" 
                                className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                onClick={() => handleReplyReaction('haha')}
                                />
                                <Image 
                                src={wowReaction} 
                                alt="like reaction" 
                                className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                onClick={() => handleReplyReaction('wow')}
                                />
                                <Image 
                                src={sadReaction} 
                                alt="like reaction" 
                                className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                onClick={() => handleReplyReaction('sad')}
                                />
                                <Image 
                                src={angryReaction} 
                                alt="like reaction" 
                                className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                onClick={() => handleReplyReaction('angry')}
                                />
                            </div>
                        )}
                    </div>

                    {currentUserID === authorID && (
                        <div className='flex gap-2'>
                            <div id='edit-control' className='hover:underline cursor-pointer' onClick={() => setIsEditingReply(true)}>
                                Edit
                            </div>

                             <div id='delete-control' className='hover:underline cursor-pointer' onClick={() => setShowDeleteReplyModal(true)}>
                                Delete

                                <Modal isOpen={showDeleteReplyModal} onRequestClose={() => setShowDeleteReplyModal(false)} className='flex flex-col items-center justify-center' style={postDeleteConfirmationModalStyle}>
                                    <div className='flex flex-col items-center justify-center h-full gap-4'>
                                        <p className='font-bold text-center text-sm'>Are you sure you want to delete this reply?</p>
                                        <div className='flex flex-row gap-4'>
                                            <button className='bg-gray-400 hover:bg-black hover:text-white font-semibold rounded-lg px-4 text-sm py-2' 
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setShowDeleteReplyModal(false)
                                                }}>Cancel</button>
                                            <button className='bg-black hover:bg-red-600 text-white font-semibold rounded-lg px-4 text-sm py-2' 
                                                onClick={
                                                    (event) => {
                                                        handleDeleteReply(event);
                                                    }
                                                }>Delete</button>
                                        </div>
                                    </div>
                                </Modal>
                            </div>
                        </div>
                    )}

                    <div id='date-control' className='flex gap-2 items-center'>
                        {formatReplyDate()}

                        {isEdited ? 
                        <div className='italic text-xs'>
                            Edited
                        </div>
                    : null}
                    </div>
                </div>

            </div>
        </div>
    )
}
