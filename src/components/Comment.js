import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast';
import { firestore } from '../lib/firebase';
import Modal from 'react-modal';
import { postDeleteConfirmationModalStyle } from '../lib/modalstyle';
import Reply from './Reply';


export default function Comment( {props} ) {

    useEffect(() => {
        if (document.getElementById('root')) {
            Modal.setAppElement('#root');
        }
    }, []);

    const {
        currentUserID,
        currentUserUsername,
        currentUserPhotoURL,
        currentUserDisplayName,
        postID, commentID,
        commentBody, commentDate, isEdited,
        authorID, authorDisplayName, 
        authorUsername, authorPhotoURL
    } = props;

    const formatCommentDate = () => {
        const date = new Date(commentDate);
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

    const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);

    const handleDeleteComment = (event) => {
        firestore.collection('posts').doc(postID).collection('comments').doc(commentID).delete()
        .then(() => {
            toast.success('Comment deleted successfully!');
        })

        event.stopPropagation();
        setShowDeleteCommentModal(false);
    }

    const [isReplying, setIsReplying] = useState(false);
    const [replyBody, setReplyBody] = useState('');

    const handleReply = (event) => {
        event.preventDefault();

        if (replyBody.trim() === '') {
            toast.error('Reply cannot be empty!');
            return;
        }

        toast.loading('Adding reply...');

        firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('replies').add({
            replyBody: replyBody,
            replyDate: new Date().toISOString(),
            authorID: currentUserID,
            authorDisplayName: props.currentUserDisplayName,
            authorUsername: props.currentUserUsername,
            authorPhotoURL: props.currentUserPhotoURL,
            isEdited: false,
        })
        .then(() => {
            toast.dismiss();
            toast.success('Reply added successfully!');
            setReplyBody('');
        })
        .catch((error) => {
            toast.dismiss();
            toast.error(error.message);
        })
    }

    const [editedCommentBody, setEditedCommentBody] = useState(commentBody);
    const [isEditingComment, setIsEditingComment] = useState(false);
    
    const handleEditComment = (event) => {
        event.preventDefault();

        if (editedCommentBody.trim() === '') {
            toast.error('Comment cannot be empty!');
            return;
        }


        firestore.collection('posts').doc(postID).collection('comments').doc(commentID).update({
            commentBody: editedCommentBody,
            isEdited: true,
            commentDate: new Date().toISOString()
        })
        .then(() => {
            toast.success('Comment edited successfully!');
            setIsEditingComment(false);
        })
        .catch((error) => {
            toast.error(error.message);
        })
    }

    // get replies
    const [replies, setReplies] = useState([]);

    useEffect(() => {
        const unsubscribe = firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('replies').orderBy('replyDate', 'desc').onSnapshot((snapshot) => {
            setReplies(snapshot.docs.map((doc) => ({
                replyID: doc.id,
                replyBody: doc.data().replyBody,
                replyDate: doc.data().replyDate,
                authorID: doc.data().authorID,
                authorDisplayName: doc.data().authorDisplayName,
                authorUsername: doc.data().authorUsername,
                authorPhotoURL: doc.data().authorPhotoURL,
                isEdited: doc.data().isEdited
            })))
        })

        return unsubscribe;
    }, [postID, commentID]);

    return (
    <div className='flex flex-row w-full items-start min-h-[60px] max-h-fit gap-2'>
        <Image src={authorPhotoURL} alt={authorUsername} 
            width={40} height={40} className='rounded-full'   
        />

        <div className='flex flex-col w-full'>
            <div className='flex flex-col gap-1 w-full bg-[#f5f5f5] items-start break-all py-2 px-3 text-sm rounded-xl border border-[#d1d1d1] drop-shadow-sm'>
                
                <div>
                    <span className='font-bold'>{authorDisplayName}</span>
                    <span className='font-bold'> · </span>
                    <Link href={`/user/${authorUsername}`} className='hover:font-bold hover:text-grass transition-all'> @{authorUsername}</Link>
                </div>
                
                {!isEditingComment && <div>{commentBody}</div>}

                {isEditingComment && 
                    <form
                        onSubmit={(event) => {
                            handleEditComment(event);
                        }}

                        className='flex flex-row w-full items-start justify-center h-full mb-1'
                    >
                        <textarea
                            value={editedCommentBody}
                            onChange={(event) => setEditedCommentBody(event.target.value)}
                            maxLength={100}
                            onKeyDown={(event => {
                                if (event.key === 'Enter') {
                                    handleEditComment(event);
                                }
                            })}
                            placeholder='Write a comment...'
                            className={`outline-none resize-none border-t border-l border-b border-[#d1d1d1] text-sm rounded-l-md text-raisin_black w-full p-3 transition-all h-[80px]`}
                        />

                        <div className='flex flex-col h-[80px] w-[40px] bg-white border-t border-r border-b border-[#d1d1d1] items-center justify-center text-xs rounded-r-md'>
                            <button type='submit' className='flex items-center h-1/2 w-full justify-center rounded-rt-md hover:bg-grass hover:text-snow rounded-tr-md'>
                                <i className='fa-solid fa-check h-1/2 flex items-center' />
                            </button>
                            <button type='button' 
                                onClick={() => {
                                    setIsEditingComment(false);
                                    setEditedCommentBody(commentBody);
                                }} 
                                className='flex items-center h-1/2 w-full justify-center hover:bg-grass hover:text-snow rounded-br-md'>
                                <i className='fa-solid fa-xmark h-1/2 flex items-center' />
                            </button>
                        </div>
                    </form>
                }
            </div>

            <div className='flex flex-row w-full text-xs gap-2 pl-3 mt-1'>
                <div id='like-control'>
                    Like
                </div>

                <div id='reply-control' 
                    className='hover:underline cursor-pointer' 
                    onClick={() => {
                        setIsReplying(true);
                        setTimeout(() => {
                            const replyBody = document.getElementById(`reply-${commentID}`);
                            if (replyBody) replyBody.focus();
                        }, 0);
                    }}
                >
                    Reply
                </div>

                {currentUserID === authorID && (
                    <div className='flex gap-2'>
                        <div id='edit-control' className='hover:underline cursor-pointer' onClick={() => setIsEditingComment(true)}>
                            Edit
                        </div>

                        <div id='delete-control' className='hover:underline cursor-pointer' onClick={() => setShowDeleteCommentModal(true)}>
                            Delete

                            <Modal isOpen={showDeleteCommentModal} onRequestClose={() => setShowDeleteCommentModal(false)} className='flex flex-col items-center justify-center' style={postDeleteConfirmationModalStyle}>
                                <div className='flex flex-col items-center justify-center h-full gap-4'>
                                    <p className='font-bold text-center text-sm'>Are you sure you want to delete this comment?</p>
                                    <div className='flex flex-row gap-4'>
                                        <button className='bg-gray-400 hover:bg-black hover:text-white font-semibold rounded-lg px-4 text-sm py-2' 
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setShowDeleteCommentModal(false)
                                            }}>Cancel</button>
                                        <button className='bg-black hover:bg-red-600 text-white font-semibold rounded-lg px-4 text-sm py-2' 
                                            onClick={
                                                (event) => {
                                                    handleDeleteComment(event);
                                                }
                                            }>Delete</button>
                                    </div>
                                </div>
                            </Modal>
                        </div>
                    </div>
                )}

                <div id='date-control' className='flex gap-2 items-center'>
                    {formatCommentDate()}
                    
                    {isEdited ? 
                        <div className='italic text-xs'>
                            Edited
                        </div>
                    : null}
                </div>
            </div>

            {replies.length > 0 && (
                <div className='mt-3 flex flex-col w-full h-fit gap-2 justify-start items-start'>
                    {replies.map((reply, index) => (
                        <div key={reply.replyID} className='w-full h-fit'>
                            <Reply 
                                props = {{
                                    currentUserID: currentUserID,
                                    currentUserUsername: currentUserUsername,
                                    currentUserPhotoURL: currentUserPhotoURL,
                                    currentUserDisplayName: currentUserDisplayName,
                                    postID: postID,
                                    commentID: commentID,
                                    isEdited: reply.isEdited,
                                    replyID: reply.replyID,
                                    replyBody: reply.replyBody,
                                    replyDate: reply.replyDate,
                                    authorID: reply.authorID,
                                    authorDisplayName: reply.authorDisplayName,
                                    authorUsername: reply.authorUsername,
                                    authorPhotoURL: reply.authorPhotoURL
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {isReplying && 
                <div className='flex flex-row w-full mt-2 '>
                    <form 
                        onSubmit={(event) => {
                            handleReply(event);
                        }}
                        className='flex flex-row w-full items-start justify-center h-full'>
                        <div className='flex aspect-square w-[40px] h-[40px] mr-2 mt-1'>
                            <Image src={currentUserPhotoURL} alt="user image" width={40} height={40} className='rounded-full drop-shadow-sm '/>
                        </div>

                        <textarea 
                            id={`reply-${commentID}`}
                            value={replyBody}
                            onChange={(event) => setReplyBody(event.target.value)}
                            maxLength={100}
                            onKeyDown={(event => {
                                if (event.key === 'Enter') {
                                    handleReply(event);
                                }
                            })}
                            placeholder='Write a reply...' 
                            className={`outline-none resize-none border border-[#d1d1d1] text-sm rounded-xl text-raisin_black w-full p-3 transition-all h-[80px]`}
                        />

                        <button
                            type='submit'
                            className='flex rounded-full aspect-square w-[40px] h-[40px] mt-1 bg-dark_gray items-center justify-center ml-2 hover:bg-grass hover:text-snow '>
                            <i className='fa-solid fa-paper-plane text-sm'></i>
                        </button>
                    </form>
                </div>
            }
        </div>

        
    </div>
    )
}
