import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Share({props}) {
    //  props={{
    //     currentUserID: currentUserID,
    //     postID: postID,
    //     postBody: postBody,
    //     postCategory: postCategory,
    //     postTrackerLocation: postTrackerLocation,
    //     postPets: postPets,
    //     postDate: postDate,
    //     imageUrls: imageUrls,
    //     authorID: authorID,
    //     authorDisplayName: authorDisplayName,
    //     authorUsername: authorUsername,
    //     authorPhotoURL: authorPhotoURL,
    //     taggedPets: taggedPets,
    //     setShowSharePostModal: setShowSharePostModal,
    // }}

    const {
        currentUserID, postID, 
        postBody, postCategory, postTrackerLocation, 
        postPets, postDate, imageUrls, 
        authorID, authorDisplayName, authorUsername, 
        authorPhotoURL, taggedPets, setShowSharePostModal
    } = props;

    const [shareBody, setShareBody] = useState('');

    const handleRepost = (e) => {
        e.preventDefault();
        toast.success('Repost button clicked!');
    }

    const handleQuote = (e) => {
        e.preventDefault();
        toast.success('Quote button clicked!');
    }

    return (
        <div className='flex flex-col w-full h-full justify-between'>
            <div className='flex flex-row w-full justify-between items-center'>
                <p className='font-bold text-center w-full pl-2'>Share {authorUsername}`s Post</p>
                <i className='fa-solid fa-circle-xmark hover:text-xanthous cursor-pointer' onClick={() => setShowSharePostModal(false)}/>
            </div>

            <div className='w-full h-full mt-5 mb-2'>
                <textarea 
                    id="share-body"
                    className='outline-none resize-none w-full border border-[#d1d1d1] rounded-lg p-2 h-full'
                />
            </div>

            <div className='flex flex-row w-full items-center justify-evenly mt-4 mb-2 text-sm'>
                <button 
                    className='flex flex-col items-center gap-1 py-3 w-[70px] rounded-md hover:bg-grass hover:text-snow transition-all'
                    onClick={() => {
                        const url = `https://bantaybuddy.vercel.app/post/${postID}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Link copied to clipboard!');
                    }}
                >
                    <i className='fa-solid fa-link'/>
                    <p>Link</p>
                </button>
                
                <button 
                    className='flex flex-col items-center gap-1 py-3 w-[70px] rounded-md hover:bg-grass hover:text-snow transition-all'
                    onClick={(e) => handleRepost(e)}
                >
                    <i className='fa-solid fa-retweet'/>
                    <p>Repost</p>
                </button>

                <button 
                    className='flex flex-col items-center gap- py-3 w-[70px] rounded-md hover:bg-grass hover:text-snow transition-all'
                    onClick={(e) => handleQuote(e)}
                >
                    <i className='fa-solid fa-quote-left'/>
                    <p>Quote</p>
                </button>
            </div>

        </div>
    )
}
