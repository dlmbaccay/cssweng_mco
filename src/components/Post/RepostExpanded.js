import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import Modal from 'react-modal';
import { firestore, storage } from '../../lib/firebase';
import { arrayRemove } from 'firebase/firestore';
import Router from 'next/router';
import toast from 'react-hot-toast';


import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/haha.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'
import { postDeleteConfirmationModalStyle, editPostModalStyle, reactionsCountModal } from '../../lib/modalstyle';
import Comment from './Comment';
import Reactions from './Reactions';

export default function RepostExpanded({props}) {

    useEffect(() => {
      if (document.getElementById('root')) {
        Modal.setAppElement('#root');
      }
    }, []);

    // if postAction is comment, direct cursor to comment box
    useEffect(() => {
        if (postAction === 'comment') {
            document.getElementById('comment-body').focus();
        }
    }, []);

    const {
        currentUserID,
        authorID, authorDisplayName, authorUsername, authorPhotoURL,
        postID, postDate, postType, postBody, isEdited, repostID, repostBody,
        repostCategory, repostPets, repostDate, repostImage,
        repostAuthorID, repostAuthorDisplayName, repostAuthorUsername,
        repostAuthorPhotoURL, setShowPostExpanded, postAction, commentsLength, reactionsLength, formatDate
    } = props;

    // get currentUser data
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (currentUserID) {
            firestore.collection('users').doc(currentUserID).get()
            .then((doc) => {
                setCurrentUser(doc.data());
            })
        }
    }, []);

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
        
    const [showDeletePostModal, setShowDeletePostModal] = useState(postAction === 'delete');
    const [showSharePostModal, setShowSharePostModal] = useState(postAction === 'share');
    const [showEditPostModal, setShowEditPostModal] = useState(postAction === 'edit');

    const [editedPostBody, setEditedPostBody] = useState(postBody);

    const [isFocused, setIsFocused] = useState(false);

    const handleDeletePost = async () => {
        try {
            // Deleting comments, replies, and their reactions associated with the post
            const commentsRef = firestore.collection('posts').doc(postID).collection('comments');
            const commentsSnapshot = await commentsRef.get();
            for (const commentDoc of commentsSnapshot.docs) {
                // Deleting reactions to each reply of a comment
                const repliesRef = commentDoc.ref.collection('replies');
                const repliesSnapshot = await repliesRef.get();
                for (const replyDoc of repliesSnapshot.docs) {
                    const replyReactionsSnapshot = await replyDoc.ref.collection('reactions').get();
                    for (const reactionDoc of replyReactionsSnapshot.docs) {
                        await reactionDoc.ref.delete();
                    }
                    // Delete the reply
                    await replyDoc.ref.delete();
                }

                // Deleting reactions to the comment
                const commentReactionsSnapshot = await commentDoc.ref.collection('reactions').get();
                for (const reactionDoc of commentReactionsSnapshot.docs) {
                    await reactionDoc.ref.delete();
                }
                // Delete the comment itself
                await commentDoc.ref.delete();
            }

            // Delete reactions to the post
            const reactionsRef = firestore.collection('posts').doc(postID).collection('reactions');
            const reactionsSnapshot = await reactionsRef.get();
            for (const reactionDoc of reactionsSnapshot.docs) {
                await reactionDoc.ref.delete();
            }

            // Delete the post from Firestore
            const postRef = firestore.collection('posts').doc(postID);
            await postRef.delete();

            // Remove the post reference from the user's posts
            const userRef = firestore.collection('users').doc(authorID);
            await userRef.update({
                posts: arrayRemove(postID)
            });

            toast.success('Post deleted successfully!');
        } catch (error) {
            
        }
    };

    const handleEditPost = async (e) => {
        e.preventDefault();

        toast.loading('Editing post...');

        const postRef = firestore.collection('posts').doc(postID);
        await postRef.update({
            postBody: editedPostBody,
            isEdited: true
        });

        e.stopPropagation();
        toast.dismiss();
        toast.success('Post edited successfully!');

        setShowEditPostModal(false);
    };

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

      toast.success('Reaction updated!');
    };

    const [currentUserReaction, setCurrentUserReaction] = useState('');

    useEffect(() => {
        const reactionsRef = firestore.collection('posts').doc(postID).collection('reactions');
        const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Your actual reaction types

        const unsubscribes = reactionTypes.map((reaction) => {
            const reactionRef = reactionsRef.doc(reaction);

            return reactionRef.onSnapshot((snapshot) => {
                const reactionData = snapshot.data();

                if (reactionData && reactionData.userIDs.includes(currentUserID)) {
                    setCurrentUserReaction(reaction);
                    return;
                }
            });
        });

        return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }, []);

    // get comments
    const [comments, setComments] = useState([]);
    
    // useffect to get comments, new comments
    useEffect(() => {
        const unsubscribe = firestore.collection('posts').doc(postID).collection('comments').orderBy('commentDate', 'desc').onSnapshot((snapshot) => {
            setComments(snapshot.docs.map((doc) => ({
                commentID: doc.id,
                commentBody: doc.data().commentBody,
                commentDate: doc.data().commentDate,
                authorID: doc.data().authorID,
                authorDisplayName: doc.data().authorDisplayName,
                authorUsername: doc.data().authorUsername,
                authorPhotoURL: doc.data().authorPhotoURL,
                isEdited: doc.data().isEdited,
            })));
        });

        return () => {
            unsubscribe();
        }
    }, []);

    const [commentBody, setCommentBody] = useState('');

    const handleComment = async (event) => {
        event.preventDefault();

        if(!commentBody) {
            toast.error('Comments cannot be empty!');
            return;
        }

        toast.loading('Posting comment...');

        const commentRef = firestore.collection('posts').doc(postID).collection('comments');

        await commentRef.add({
            commentBody: commentBody,
            commentDate: new Date().toISOString(),
            authorID: currentUserID,
            authorDisplayName: currentUser.displayName,
            authorUsername: currentUser.username,
            authorPhotoURL: currentUser.photoURL,
            isEdited: false,
        });

        setCommentBody('');

        toast.dismiss();
        toast.success('Comment posted successfully!');
    }

    const [showReactionsModal, setShowReactionsModal] = useState(false);
    
    return (
        <div className='w-full h-full flex flex-col'>
            {/* expanded controls */}
            <div className='w-full h-10 pt-4 rounded-t-lg flex flex-row justify-between items-center pr-4 pl-4'>
                <h1 className='w-full text-center font-bold'>
                    {authorDisplayName}&apos;s Post
                </h1>

                <i  
                    onClick={() => setShowPostExpanded(false)}
                    className='fa-solid fa-circle-xmark font-bold hover:text-xanthous cursor-pointer'
                 />
            </div>
        
            {/* expanded post */}
            <div
                className='w-full h-full rounded-lg mt-2 pr-6 pl-6 flex flex-col overflow-y-auto'>

                {/* Header */}
                <div id='post-header' className='flex flex-row'>
                    <div id='user-image' className='flex flex-row justify-start items-start'>
                    <Image 
                        src={authorPhotoURL} alt='Profile Picture' width={45} height={45}
                        className='rounded-full drop-shadow-sm aspect-square'
                    />
                    </div>

                    <div id='post-meta' className='ml-4 items-center justify-center'>
                        <div id='user-meta' className='flex flex-row gap-2'>
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
                <div className='mt-3 flex flex-col w-full border border-[#d1d1d1] rounded-lg p-4 bg-[#] drop-shadow-md'>
                    
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

                {/* Footer */}
                <div id='post-footer' className='mt-4 pb-4 flex flex-row w-full justify-between relative border-b border-dark_gray'>
                    <div id="left" className='flex flex-row gap-4'>
                        <div id='post-reaction-control' className='flex flex-row justify-center items-center gap-2'>
                            {currentUserReaction === '' && 
                            <i 
                                className={`fa-solid fa-heart hover:text-grass hover:cursor-pointer transition-all ${isOverlayVisible? "text-grass" : ""}`}
                                onMouseEnter={() => setIsOverlayVisible(true)}
                                onMouseLeave={() => setIsOverlayVisible(false)}
                            />
                            }
                            
                            {currentUserReaction === 'like' &&
                            <Image
                                src={likeReaction}
                                alt="like reaction"
                                className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                onMouseEnter={() => setIsOverlayVisible(true)}
                                onMouseLeave={() => setIsOverlayVisible(false)} 
                            />
                            }

                            {currentUserReaction === 'heart' &&
                            <Image
                                src={heartReaction}
                                alt="heart reaction"
                                className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                onMouseEnter={() => setIsOverlayVisible(true)}
                                onMouseLeave={() => setIsOverlayVisible(false)} 
                            />
                            }

                            {currentUserReaction === 'haha' &&
                            <Image
                                src={laughReaction}
                                alt="haha reaction"
                                className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                onMouseEnter={() => setIsOverlayVisible(true)}
                                onMouseLeave={() => setIsOverlayVisible(false)} 
                            />
                            }

                            {currentUserReaction === 'wow' &&
                            <Image
                                src={wowReaction}
                                alt="wow reaction"
                                className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                onMouseEnter={() => setIsOverlayVisible(true)}
                                onMouseLeave={() => setIsOverlayVisible(false)} 
                            />
                            }

                            {currentUserReaction === 'sad' &&
                            <Image
                                src={sadReaction}
                                alt="sad reaction"
                                className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                onMouseEnter={() => setIsOverlayVisible(true)}
                                onMouseLeave={() => setIsOverlayVisible(false)} 
                            />
                            }

                            {currentUserReaction === 'angry' &&
                            <Image
                                src={angryReaction}
                                alt="angry reaction"
                                className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                onMouseEnter={() => setIsOverlayVisible(true)}
                                onMouseLeave={() => setIsOverlayVisible(false)} 
                            />
                            }
                        <p>{reactionsLength}</p>

                        {isOverlayVisible && (
                            <div 
                            onMouseEnter={() => setIsOverlayVisible(true)}
                            onMouseLeave={() => setIsOverlayVisible(false)}
                            id='overlay' 
                            className='absolute bottom-2 -left-2 flex flex-row gap-2 w-[300px] h-[45px] justify-center items-center bg-dark_gray rounded-full drop-shadow-sm transition-all' 
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
                        <i className="fa-solid fa-comment hover:text-grass hover:cursor-pointer transition-all" 
                            onClick={() => {
                                document.getElementById('comment-body').focus();
                            }}
                            />
                        <p>{commentsLength}</p>
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

                <div id="right" className='flex flex-row gap-4 items-center'>
                    {currentUserID !== authorID && 
                    <div id='report-control'>
                        <i className="fa-solid fa-flag hover:text-grass hover:cursor-pointer transition-all"></i>
                    </div>
                    }

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

                            <div className='h-full mt-2 mb-4 w-full flex flex-col justify-start gap-4'>
                                <textarea 
                                    id="post-body" 
                                    value={editedPostBody}
                                    onChange={(event) => setEditedPostBody(event.target.value)}
                                    placeholder='What`s on your mind?' 
                                    className='outline-none resize-none border border-[#d1d1d1] rounded-md text-raisin_black w-full p-4 h-full' 
                                />
                            </div>
                            
                            <div className='flex flex-row gap-2'>
                                <button 
                                className='px-4 py-2 font-semibold hover:bg-black hover:text-snow rounded-lg text-sm cursor-pointer w-1/2 transition-all'
                                onClick={() => setShowEditPostModal(false)}>
                                    Cancel
                                </button>

                                <button 
                                className='bg-black hover:bg-grass text-white font-semibold rounded-md px-4 text-sm py-2 w-1/2 transition-all' 
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

                        <Modal isOpen={showDeletePostModal} onRequestClose={() => setShowDeletePostModal(false)} className='flex flex-col items-center justify-center outline-none' style={postDeleteConfirmationModalStyle}>
                            <div className='flex flex-col items-center justify-center h-full gap-4'>
                            <p className='font-bold text-center'>Are you sure you want to delete this post?</p>
                            <div className='flex flex-row gap-4'>
                                <button className='bg-gray-400 hover:bg-black hover:text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={() => setShowDeletePostModal(false)}>Cancel</button>
                                <button className='bg-black hover:bg-red-600 text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={handleDeletePost}>Delete</button>
                            </div>
                            </div>
                        </Modal>
                        </div>
                    </>
                    )}
                </div>
                </div>

                {/* Reactions */}
                <div className='w-fit text-sm mt-3 hover:underline cursor-pointer' onClick={() => setShowReactionsModal(true)}>
                    View Reactions...

                    <Modal isOpen={showReactionsModal} onRequestClose={() => setShowReactionsModal(false)} className='flex flex-col items-center justify-center outline-none' style={reactionsCountModal}>

                        <Reactions props={{
                            postID: postID,
                            setShowReactionsModal: setShowReactionsModal,
                            }} 
                        />

                    </Modal>
                </div>

                {/* Comments */}
                <div id='post-comments' className='mt-3 mb-4 flex h-full flex-col w-full justify-between relative'>
                    
                    {comments.length === 0 ? (
                        <div className='flex text-sm'>
                            No comments yet...
                        </div>    
                    ) : (
                        <div className='flex flex-col w-full h-fit gap-3 justify-start items-start'>
                            {comments.map((comment, index) => (
                                <div key={comment.commentID} className='w-full h-fit'>
                                    <Comment 
                                        props = {{
                                            currentUserID: currentUserID,
                                            currentUserPhotoURL: currentUser.photoURL,
                                            currentUserUsername: currentUser.username,
                                            currentUserDisplayName: currentUser.displayName,
                                            postID: postID,
                                            isEdited: comment.isEdited,
                                            commentID: comment.commentID,
                                            commentBody: comment.commentBody,
                                            commentDate: comment.commentDate,
                                            authorID: comment.authorID,
                                            authorDisplayName: comment.authorDisplayName,
                                            authorUsername: comment.authorUsername,
                                            authorPhotoURL: comment.authorPhotoURL,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 
                        - comments is a subcollection under posts
                        has commentID, commentBody, commentDate, authorID, authorDisplayName, authorUsername, authorPhotoURL
                        - comments has a subcollection called replies
                        replies has replyID, replyBody, replyDate, authorID, authorDisplayName, authorUsername, authorPhotoURL
                    */}

                </div>
            </div>

            {/* write comment */}
            <div id='write-comment' className='mt-3 pb-3 pl-6 pr-6'>
                <form 
                    onSubmit={handleComment}
                    className='flex flex-row items-start justify-center h-full'>
                    <div className='flex aspect-square w-[40px] h-[40px] mr-2 mt-1'>
                        {currentUser && <Image src={currentUser.photoURL} alt="user image" width={40} height={40} className='rounded-full drop-shadow-sm '/>}
                    </div>

                    <textarea 
                        id="comment-body" 
                        value={commentBody}
                        onChange={(event) => setCommentBody(event.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        maxLength={100}
                        onKeyDown={(event => {
                            if (event.key === 'Enter') {
                                handleComment(event);
                            }
                        })}
                        placeholder='Write a comment...' 
                        className={`outline-none resize-none border bg-[#fafafafa] text-md border-[#d1d1d1] rounded-xl text-raisin_black w-full p-3 transition-all ${isFocused ? 'max-h-[80px]' : 'max-h-[50px]'}`}
                    />

                    <button
                        type='submit'
                        className='flex rounded-full aspect-square w-[40px] h-[40px] mt-1 bg-dark_gray items-center justify-center ml-2 hover:bg-grass hover:text-snow '>
                        <i className='fa-solid fa-paper-plane text-sm'></i>
                    </button>
                </form>
            </div>  
        </div>
    )
}