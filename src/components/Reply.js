import React from 'react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { firestore } from '../lib/firebase';
import Modal from 'react-modal';
import { postDeleteConfirmationModalStyle } from '../lib/modalstyle';
import Link from 'next/link'

export default function Reply({props}) {

    const {
        currentUserID, currentUserUsername, currentUserPhotoURL, currentUserDisplayName,
        postID, commentID, replyID, replyBody, replyDate,
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

    const handleDeleteReply = (event) => {

        // Delete reply from firestore
        firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('replies').doc(replyID).delete();

        event.stopPropagation();
        setShowDeleteReplyModal(false);
        toast.success('Reply deleted successfully!');
    }

    return (
        <div className='flex flex-row w-full items-start min-h-[60px] max-h-fit gap-2'>
            <Image src={authorPhotoURL} alt={authorDisplayName} width={40} height={40} className='rounded-full' />

            <div className='flex flex-col w-full'>
                <div className='flex flex-col gap-1 w-full bg-dark_gray items-start break-all py-2 px-3 text-sm rounded-xl border border-[#d1d1d1] drop-shadow-sm'>
                    <div>
                        <span className='font-bold'>{authorDisplayName}</span>
                        <span className='font-bold'> · </span>
                        <Link href={`/user/${authorUsername}`} className='hover:font-bold hover:text-grass transition-all'> @{authorUsername}</Link>
                    </div>
                    
                    {replyBody}
                </div>

                <div className='flex flex-row w-full text-xs gap-2 pl-3 mt-1'>
                    <div id='like-control'>
                        Like
                    </div>

                    {currentUserID === authorID && (
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
                    )}

                    <div id='date-control'>
                        {formatReplyDate()}
                    </div>
                </div>

            </div>
        </div>
    )
}
